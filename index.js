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

        app.get('/', (req, res) => {
            dBase
                .collection(feedCollection)
                .find()
                .toArray((err, results) => {
                    if (err) res.send(err);
                    else res.send(results);
                });
        });

        app.post('/add', (req, res) => {
            let stuff = {
                first: req.body.stuff,
                second: req.body.moreStuff,
            };

            dBase.collection(feedCollection).insertOne(stuff, (err, item) => {
                if (err) res.send(err);
                else res.send(`Added some stuff\n${item.insertedId}`);
            });
        });

        app.listen(port, () => console.log(`Listening at ${port}`));
    },
);
