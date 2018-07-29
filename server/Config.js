const fs = require('fs'),
    path = require('path');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const feedDefaults = JSON.parse(fs.readFileSync('feed_defaults.json', 'utf8'));

let Config = {
    feedDefaults: feedDefaults,
    localImagesUri: path.join(__dirname, '/images/'), // eslint-disable-line
    localFeedsUri: path.join(__dirname, '/feeds/'), // eslint-disable-line
    localEpisodesUri: path.join(__dirname, '/episodes/'), // eslint-disable-line
    ImagesUri: `${feedDefaults.link}images/`,
    FeedsUri: `${feedDefaults.link}feeds/`,
    EpisodesUri: `${feedDefaults.link}episodes/`
};

for (var prop in config) Config[prop] = config[prop];

module.exports = Config; // eslint-disable-line
