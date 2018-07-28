const mongoClient = require('mongodb').MongoClient,
    objectId = require('mongodb').ObjectID,
    bodyParser = require('body-parser'),
    express = require('express'),
    multer = require('multer'),
    CreatePodcast = require('./PodcastGenerator'),
    path = require('path'),
    fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8')),
    app = express(),
    imagesUri = path.join(__dirname, '/images/'), // eslint-disable-line
    feedsUri = path.join(__dirname, '/feeds/'), // eslint-disable-line
    episodesUri = path.join(__dirname, '/episodes/'), // eslint-disable-line
    uploadImage = multer({ dest: imagesUri }).single('podcast-image'),
    uploadEpisode = multer({ dest: episodesUri }).single('podcast-episode');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/images/', express.static(imagesUri));
app.use('/feeds/', express.static(feedsUri));
app.use('/episodes/', express.static(episodesUri));

mongoClient.connect(
    config.databaseUri,
    { useNewUrlParser: true },
    (err, db) => {
        if (err) console.log(`Failed connecting to mongoDB:\n${err}`);

        let dBase = db.db(config.databaseName);
        let feeds = dBase.collection(config.collectionName);

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
            res.send('ep up');
        });

        app.listen(config.port, () =>
            console.log(`Listening at ${config.port}`)
        );
    }
);
