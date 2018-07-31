const fs = require('fs'),
    path = require('path');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const feedDefaults = JSON.parse(fs.readFileSync('feed_defaults.json', 'utf8'));
const localImagesUri = path.join(__dirname, '/images/'); // eslint-disable-line
const localFeedsUri = path.join(__dirname, '/feeds/');// eslint-disable-line
const localEpisodesUri = path.join(__dirname, '/episodes/'); // eslint-disable-line

let Config = {
    feedDefaults: feedDefaults,
    localImagesUri: localImagesUri,
    localFeedsUri: localFeedsUri,
    localEpisodesUri: localEpisodesUri,
    ImagesUri: `${feedDefaults.link}images/`,
    FeedsUri: `${feedDefaults.link}feeds/`,
    EpisodesUri: `${feedDefaults.link}episodes/`,
    feedTemplateUri: localFeedsUri + 'feed_template.xml',
    itemTemplateUri: localFeedsUri + 'item_template.xml'
};

for (var prop in config) Config[prop] = config[prop];

module.exports = Config; // eslint-disable-line
