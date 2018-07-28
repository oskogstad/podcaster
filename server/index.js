const mongoClient = require('mongodb').MongoClient,
    objectId = require('mongodb').ObjectID,
    bodyParser = require('body-parser'),
    express = require('express'),
    multer = require('multer'),
    getPodcast = require('./PodcastGenerator'),
    path = require('path'),
    fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8')),
    app = express(),
    imagesUri = path.join(__dirname, '/images/'), // eslint-disable-line
    feedsUri = path.join(__dirname, '/feeds/'), // eslint-disable-line
    upload = multer({ dest: imagesUri });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.single('podcast-image'));
app.use('/images/', express.static(imagesUri));
app.use('/feeds/', express.static(feedsUri));

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
        app.post('/api/feed/add', (req, res) => {
            let podcast = getPodcast(req);

            feeds.insertOne(podcast, err => {
                if (err) res.send(err);
                else res.send(podcast);
            });
        });

        app.listen(config.port, () =>
            console.log(`Listening at ${config.port}`)
        );
    }
);
