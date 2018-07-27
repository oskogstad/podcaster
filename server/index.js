const mongoClient = require('mongodb').MongoClient,
    objectId = require('mongodb').ObjectID,
    bodyParser = require('body-parser'),
    express = require('express'),
    multer = require('multer'),
    crypto = require('crypto'),
    path = require('path'),
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync('config.json', 'utf8')),
    port = config.port,
    databaseUri = config.databaseUri,
    app = express(),
    images = '/images/',
    imagesUri = path.join(__dirname, images),
    upload = multer({ dest: imagesUri }),
    feedsUri = path.join(__dirname, '/feeds/');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.single('podcast-image'));
app.use(images, express.static(imagesUri));

mongoClient.connect(
    databaseUri,
    { useNewUrlParser: true },
    (err, db) => {
        if (err) console.log(err);

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
            let podcast = {
                name: req.body.name,
                pid: crypto.randomBytes(10).toString('hex')
            };

            let feedFileName =
                podcast.pid +
                '_' +
                podcast.name.replace(/[^\w\s]/g, '').replace(/\s/g, '_') +
                '.xml';

            fs.createReadStream(feedsUri + 'feed_template.xml').pipe(
                fs.createWriteStream(feedsUri + feedFileName)
            );

            fs.rename(
                `${imagesUri}${req.file.filename}`,
                `${imagesUri}${podcast.pid}.png`,
                err => {
                    if (err) console.log(`Failed changing filename:\n${err}`);
                }
            );

            feeds.insertOne(podcast, (err, item) => {
                if (err) res.send(err);
                else {
                    let newFeed = {
                        id: item.insertedId
                    };
                    res.send(newFeed);
                }
            });
        });

        app.listen(port, () => console.log(`Listening at ${port}`));
    }
);
