const mongoClient = require('mongodb').MongoClient,
    objectId = require('mongodb').ObjectID,
    bodyParser = require('body-parser'),
    express = require('express'),
    multer = require('multer'),
    path = require('path'),
    CreatePodcast = require('./PodcastGenerator'),
    CreateEpisode = require('./EpisodeGenerator'),
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

mongoClient.connect(
    Config.databaseUri,
    { useNewUrlParser: true },
    (err, db) => {
        if (err) console.log(`Failed connecting to mongoDB:\n${err}`);

        let dBase = db.db(Config.databaseName);
        let feeds = dBase.collection(Config.feedCollection);
        let episodes = dBase.collection(Config.episodeCollection);

        app.get('/', (req, res) => {
            feeds.find().toArray((err, feeds) => {
                if (err) res.send(err);
                else res.render('feeds', { feeds: feeds });
            });
        });

        app.get('/podcast/:id', (req, res) => {
            let id = objectId(req.params.id);
            feeds.find(id).toArray((err, result) => {
                if (err) res.send(err);
                else res.render('podcast', { podcast: result[0] });
            });
        });

        app.get('/addfeed', (req, res) => {
            res.render('addFeed');
        });

        app.get('/addepisode', (req, res) => {
            res.render('addEpisode');
        });

        app.post('/api/feed/add', uploadImage, (req, res) => {
            let podcast = CreatePodcast(req);

            feeds.insertOne(podcast, err => {
                if (err) res.send(err);
                else res.render('podcast', { podcast: podcast });
            });
        });

        app.post('/api/episode/add', uploadEpisode, (req, res) => {
            let episode = CreateEpisode(req);

            episodes.insertOne(episode, err => {
                if (err) res.send(err);
                else res.render('episode', { episode: episode });
            });
        });

        app.listen(Config.port, () =>
            console.log(`Listening at ${Config.port}`)
        );
    }
);
