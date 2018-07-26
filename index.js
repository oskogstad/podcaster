const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const databaseUri = 'mongodb://localhost:27017/podcaster';
const feedCollection = 'feed';
const port = 8182;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoClient.connect(
    databaseUri,
    { useNewUrlParser: true },
    (err, db) => {
        if (err) {
            console.log(err);
        }
        console.log('Connected to Mongo');
        let dBase = db.db('crud');
        let feeds = dBase.collection(feedCollection);

        app.get('/feeds', (req, res) => {
            feeds.find().toArray((err, results) => {
                if (err) res.send(err);
                else res.send(results);
            });
        });

        app.post('/feed', (req, res) => {
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
