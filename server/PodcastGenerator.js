const crypto = require('crypto'),
    xml2js = require('xml2js'),
    fs = require('fs'),
    path = require('path');

const feedDefaults = JSON.parse(fs.readFileSync('feed_defaults.json', 'utf8')),
    imagesUri = path.join(__dirname, '/images/'), // eslint-disable-line
    feedsUri = path.join(__dirname, '/feeds/'); // eslint-disable-line

function GetFeedFileName(pid, title) {
    return (
        pid +
        '_' +
        title
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s\s+/g, ' ')
            .replace(/\s/g, '_') +
        '.xml'
    );
}

function CreateFeedFile(podcast) {
    fs.readFile(feedsUri + 'feed_template.xml', 'utf-8', (err, data) => {
        if (err) console.log(`Failed reading xml feed template:\n${err}`);

        xml2js.parseString(data, (err, result) => {
            if (err) console.log(`Failed parsing xml feed template:\n${err}`);

            let feedFileName = GetFeedFileName(podcast.pid, podcast.title);
            let json = result.rss.channel[0];

            json.link[0] = feedDefaults.link;
            json.language[0] = feedDefaults.language;
            json.copyright[0] = feedDefaults.copyright;
            json.webMaster[0] = feedDefaults.webMaster;
            json.managingEditor[0] = feedDefaults.managingEditor;
            json.image[0].title[0] = feedDefaults.image.title;
            json.image[0].link[0] = feedDefaults.link;

            json['itunes:owner'][0]['itunes:name'][0] =
                feedDefaults['itunes:owner']['itunes:name'];
            json['itunes:owner'][0]['itunes:email'][0] =
                feedDefaults['itunes:owner']['itunes:email'];
            json['itunes:category'][0].$.text = feedDefaults['itunes:category'];
            json['itunes:keywords'][0] = feedDefaults['itunes:keywords'];
            json['itunes:author'][0] = feedDefaults['itunes:author'];

            result.rss.channel[0] = json;

            let builder = new xml2js.Builder();
            let xml = builder.buildObject(result);

            fs.writeFile(feedsUri + feedFileName, xml, err => {
                if (err) console.log(`Failed writing new xml file:\n${err}`);
            });
        });
    });
}

function RenameImageFile(podcast, currentFileName) {
    fs.rename(
        `${imagesUri}${currentFileName}`,
        `${imagesUri}${podcast.pid}.png`,
        err => {
            if (err) console.log(`Failed changing image filename:\n${err}`);
        }
    );
}

function GetPodcast(req) {
    let pid = crypto.randomBytes(10).toString('hex');
    let now = new Date().toString();

    let podcast = {
        title: req.body.title,
        pid: pid,
        keywords: req.body.keywords,
        pubDate: now,
        description: req.body.description,
        subtitle: req.body.subtitle,
        lastBuildDate: now,
        feedUri: `${feedDefaults.link}feeds/${GetFeedFileName(
            pid,
            req.body.title
        )}`,
        imageUri: `${feedDefaults.link}images/${pid}.png`
    };

    CreateFeedFile(podcast);
    RenameImageFile(podcast, req.file.filename);

    return podcast;
}

module.exports = GetPodcast; // eslint-disable-line
