const mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    express = require('express'),
    multer = require('multer'),
    path = require('path'),
    CreatePodcast = require('./PodcastGenerator'),
    CreateEpisode = require('./EpisodeGenerator'),
    Podcast = require('./models/podcast'),
    Episode = require('./models/episode'),
    Config = require('./Config');

const app = express(),
    uploadImage = multer({ dest: Config.localImagesUri }).single(
        'podcast-image'
    ),
    uploadEpisode = multer({ dest: Config.localEpisodesUri }).single(
        'podcast-episode'
    );

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views')); // eslint-disable-line

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/images/', express.static(Config.localImagesUri));
app.use('/feeds/', express.static(Config.localFeedsUri));
app.use('/episodes/', express.static(Config.localEpisodesUri));

mongoose.connect(
    Config.databaseUri,
    { useNewUrlParser: true },
    err => {
        if (err) console.log(`Failed connecting to mongoDB:\n${err}`);
    }
);

app.get('/', (req, res) => {
    Podcast.find({}, (err, podcasts) => {
        if (err) res.send(err);
        else res.render('podcasts', { podcasts: podcasts });
    });
});

app.get('/podcast/:pid', (req, res) => {
    Podcast.findOne({ pid: req.params.pid }, (err, podcast) => {
        if (err) res.send(err);
        else res.render('podcast', { podcast: podcast });
    });
});

app.get('/add-podcast', (req, res) => {
    res.render('add-podcast');
});

app.get('/add-episode', (req, res) => {
    res.render('add-episode');
});

app.post('/podcast/add', uploadImage, (req, res) => {
    let podcast = CreatePodcast(req);

    Podcast.create(podcast, (err, result) => {
        if (err) res.send(err);
        else res.render('podcast', { podcast: result });
    });
});

app.post('/episode/add', uploadEpisode, (req, res) => {
    let episode = CreateEpisode(req);

    Episode.create(episode, (err, result) => {
        if (err) res.send(err);
        else res.render('episode', { episode: result });
    });
});

app.listen(Config.port, () => console.log(`Listening at ${Config.port}`));
