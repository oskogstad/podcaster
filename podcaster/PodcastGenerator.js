const xml2js = require('xml2js'),
    Config = require('./Config'),
    Utils = require('./Utils'),
    Podcast = require('./models/podcast'),
    fs = require('fs');

function GetFeedFileName(pid) {
    return pid + '.xml';
}

function CreateFeedFile(podcast) {
    fs.readFile(Config.feedTemplateUri, 'utf-8', (err, data) => {
        if (err) console.log(`Failed reading xml feed template:\n${err}`);

        xml2js.parseString(data, (err, result) => {
            if (err) console.log(`Failed parsing xml feed template:\n${err}`);

            let feedFileName = GetFeedFileName(podcast.pid);
            let json = result.rss.channel[0];

            json.link[0] = Config.feedDefaults.baseURL;
            json.language[0] = Config.feedDefaults.language;
            json.copyright[0] = Config.feedDefaults.copyright;
            json.webMaster[0] = Config.feedDefaults.webMaster;
            json.managingEditor[0] = Config.feedDefaults.managingEditor;
            json.image[0].title[0] = Config.feedDefaults.image.title;
            json.image[0].link[0] = Config.feedDefaults.baseURL;
            json.image[0].url[0] = `${Config.ImagesUri}${podcast.pid}.png`;

            json['itunes:owner'][0]['itunes:name'][0] =
                Config.feedDefaults['itunes:owner']['itunes:name'];
            json['itunes:owner'][0]['itunes:email'][0] =
                Config.feedDefaults['itunes:owner']['itunes:email'];
            json['itunes:category'][0].$.text =
                Config.feedDefaults['itunes:category'];
            if (podcast.keywords) json['itunes:keywords'][0] = podcast.keywords;
            else
                json['itunes:keywords'][0] =
                    Config.feedDefaults['itunes:keywords'];
            json['itunes:author'][0] = podcast.author;

            json['atom:link'][0].$.href = `${Config.FeedsUri}${GetFeedFileName(
                podcast.pid
            )}`;
            json['itunes:image'][0].$.href = `${Config.ImagesUri}${
                podcast.pid
            }.png`;
            json.pubDate[0] = podcast.pubDate;
            json.title[0] = podcast.title;
            json.description[0] = podcast.description;
            json['itunes:summary'][0] = podcast.description;
            json['itunes:subtitle'][0] = podcast.subtitle;
            json.lastBuildDate[0] = podcast.lastBuildDate;

            result.rss.channel[0] = json;

            let builder = new xml2js.Builder();
            let xml = builder.buildObject(result);

            fs.writeFile(Config.localFeedsUri + feedFileName, xml, err => {
                if (err) console.log(`Failed writing new xml file:\n${err}`);
            });
        });
    });
}

function CreatePodcast(req) {
    let pid = Utils.GenerateID();
    let now = new Date().toString();

    let podcast = new Podcast({
        title: req.body.title,
        pid: pid,
        keywords: req.body.keywords,
        pubDate: now,
        description: req.body.description,
        subtitle: req.body.subtitle,
        lastBuildDate: now,
        author: req.body.author
    });

    CreateFeedFile(podcast);
    Utils.RenameFile(
        Config.localImagesUri,
        podcast.pid,
        req.file.filename,
        '.png'
    );

    return podcast;
}

module.exports = CreatePodcast; // eslint-disable-line
