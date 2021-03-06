const fs = require('fs'),
    path = require('path');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const feedDefaults = JSON.parse(fs.readFileSync('feed_defaults.json', 'utf8'));
const localImagesUri = path.join(__dirname, '/images/'); // eslint-disable-line
const localFeedsUri = path.join(__dirname, '/feeds/');// eslint-disable-line
const localEpisodesUri = path.join(__dirname, '/episodes/'); // eslint-disable-line
const jsUri = path.join(__dirname, '/js/'); // eslint-disable-line
const cssUri = path.join(__dirname, '/css/'); // eslint-disable-line
const fontsUri = path.join(__dirname, '/fonts/'); // eslint-disable-line

let Config = {
    feedDefaults,
    localImagesUri,
    localFeedsUri,
    localEpisodesUri: localEpisodesUri,
    jsUri,
    cssUri,
    fontsUri,
    ImagesUri: `${feedDefaults.baseURL}images/`,
    FeedsUri: `${feedDefaults.baseURL}feeds/`,
    EpisodesUri: `${feedDefaults.baseURL}episodes/`,
    feedTemplateUri: localFeedsUri + 'feed_template.xml',
    itemTemplateUri: localFeedsUri + 'item_template.xml'
};

for (var prop in config) Config[prop] = config[prop];

module.exports = Config; // eslint-disable-line
