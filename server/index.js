const mongoClient = require('mongodb').MongoClient,
    objectId = require('mongodb').ObjectID,
    bodyParser = require('body-parser'),
    express = require('express'),
    multer = require('multer'),
    CreatePodcast = require('./PodcastGenerator'),
    Config = require('./Config'),
    Utils = require('./Utils');

const app = express(),
    uploadImage = multer({ dest: Config.localImagesUri }).single(
        'podcast-image'
    ),
    uploadEpisode = multer({ dest: Config.localEpisodesUri }).single(
        'podcast-episode'
    );

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

        // GET ALL FEEDS
        app.get('/api/feeds', (req, res) => {
            feeds.find().toArray((err, results) => {
                if (err) res.send(err);
                else res.send(results);
            });
        });

        // GET ONE FEED BY ID
        app.get('/api/feed/:id', (req, res) => {
            let id = objectId(req.params.id);
            feeds.find(id).toArray((err, result) => {
                if (err) res.send(err);
                else res.send(result);
            });
        });

        // ADD NEW FEED
        app.post('/api/feed/add', uploadImage, (req, res) => {
            let podcast = CreatePodcast(req);

            feeds.insertOne(podcast, err => {
                if (err) res.send(err);
                else res.send(podcast);
            });
        });

        // ADD NEW EPISODE
        app.post('/api/episode/add', uploadEpisode, (req, res) => {
            let now = new Date().toString();
            let eid = Utils.GenerateID();

            Utils.RenameFile(
                Config.localEpisodesUri,
                eid,
                req.file.filename,
                '.mp3'
            );

            let episodeUri = `${Config.feedDefaults.link}episodes/${eid}.mp3`;

            let episode = {
                eid: eid,
                feedUri: req.body.feedUri,
                title: req.body.title,
                summary: req.body.summary,
                subtitle: req.body.subtitle,
                category: req.body.category,
                episodeUri: episodeUri,
                duration: req.body.duration,
                pubDate: now
            };

            episodes.insertOne(episode, err => {
                if (err) res.send(err);
                else res.send(episode);
            });
        });

        app.listen(Config.port, () =>
            console.log(`Listening at ${Config.port}`)
        );
    }
);
