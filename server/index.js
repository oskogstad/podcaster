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
                description: req.body.description,
                title: req.body.title,
                summary: req.body.summary,
                subtitle: req.body.subtitle,
                episodeUri: episodeUri,
                duration: req.body.duration,
                pubDate: now,
                author: req.body.author
            };

            let fs = require('fs');
            let xml2js = require('xml2js');

            fs.readFile(
                Config.localFeedsUri + 'item_template.xml',
                'utf-8',
                (err, data) => {
                    if (err)
                        console.log(
                            `Failed reading xml item template:\n${err}`
                        );

                    xml2js.parseString(data, (err, result) => {
                        if (err)
                            console.log(
                                `Failed parsing xml item template:\n${err}`
                            );

                        let item = result.item;

                        item.title[0] = episode.title;
                        item.description[0] = episode.description;
                        item['itunes:summary'][0] = episode.summary;
                        item['itunes:subtitle'][0] = episode.subtitle;
                        item.enclosure[0].$.url = episode.episodeUri;
                        item.guid[0] = episode.episodeUri;
                        item['itunes:duration'][0] = episode.duration;
                        item.pubDate[0] = now;
                        if (episode.author) {
                            item['itunes:author'] = [];
                            item['itunes:author'][0] = episode.author;
                        }

                        let feedFileName = episode.feedUri.substring(
                            Config.FeedsUri.length
                        );

                        fs.readFile(
                            Config.localFeedsUri + feedFileName,
                            (err, data) => {
                                if (err)
                                    console.log(
                                        `Failed reading podcast xml feed when adding new episode:\n${err}`
                                    );
                                xml2js.parseString(data, (err, result) => {
                                    if (err)
                                        console.log(
                                            `Failed paring podcast feed xml when adding new episode:\n${err}`
                                        );
                                    let json = result.rss.channel[0];

                                    if (json.item) json.item.unshift(item);
                                    else {
                                        json.item = [];
                                        json.item.push(item);
                                    }
                                    json.lastBuildDate[0] = now;

                                    result.rss.channel[0] = json;

                                    let builder = new xml2js.Builder();
                                    let xml = builder.buildObject(result);

                                    fs.writeFile(
                                        Config.localFeedsUri + feedFileName,
                                        xml,
                                        err => {
                                            if (err)
                                                console.log(
                                                    `Failed writing xml file after adding new episode:\n${err}`
                                                );
                                        }
                                    );
                                });
                            }
                        );
                    });
                }
            );

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
