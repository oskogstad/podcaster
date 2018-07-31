const xml2js = require('xml2js'),
    Config = require('./Config'),
    Utils = require('./Utils'),
    fs = require('fs');

function WriteEpisodeToFeed(episode) {
    fs.readFile(
        Config.localFeedsUri + 'item_template.xml',
        'utf-8',
        (err, data) => {
            if (err) console.log(`Failed reading xml item template:\n${err}`);

            xml2js.parseString(data, (err, result) => {
                if (err)
                    console.log(`Failed parsing xml item template:\n${err}`);

                let item = result.item;

                item.title[0] = episode.title;
                item.description[0] = episode.description;
                item['itunes:summary'][0] = episode.summary;
                item['itunes:subtitle'][0] = episode.subtitle;
                item.enclosure[0].$.url = episode.episodeUri;
                item.guid[0] = episode.episodeUri;
                item['itunes:duration'][0] = episode.duration;
                item.pubDate[0] = episode.pubDate;
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
                            json.lastBuildDate[0] = episode.pubDate;

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
}

function CreateEpisode(req) {
    let now = new Date().toString();
    let eid = Utils.GenerateID();

    Utils.RenameFile(Config.localEpisodesUri, eid, req.file.filename, '.mp3');
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

    WriteEpisodeToFeed(episode);
    return episode;
}

module.exports = CreateEpisode; // eslint-disable-line
