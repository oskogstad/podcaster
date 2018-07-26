const mongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const express = require('express');
const feedCollection = 'feed';
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const port = config.port;
const databaseUri = config.databaseUri;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoClient.connect(
    databaseUri,
    { useNewUrlParser: true },
    (err, db) => {
        if (err) console.log(err);

        let dBase = db.db('crud');
        let feeds = dBase.collection(feedCollection);

        // GET ALL FEEDS
        app.get('/api/feeds', (req, res) => {
            feeds
                .find()
                .toArray((err, results) => {
                    if (err) res.send(err);
                    else res.send(results);
                });
        });

        // GET ONE FEED BY ID
        app.get('/api/feed/:id', (req, res) => {
            let id = objectId(req.params.id);
            feeds
                .find(id)
                .toArray((err, result) => {
                    if (err) res.send(err);
                    else res.send(result);
                });
        });

        // ADD NEW FEED
        app.post('/api/feed/add', (req, res) => {
            let stuff = {
                name: req.body.name,
            };

            feeds.insertOne(stuff, (err, item) => {
                if (err) res.send(err);
                else {
                    let newFeed = {
                        id: item.insertedId,
                    };
                    res.send(newFeed);
                }
            });
        });

        app.listen(port, () => console.log(`Listening at ${port}`));
    },
);
