const fs = require('fs'),
    path = require('path');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const feedDefaults = JSON.parse(fs.readFileSync('feed_defaults.json', 'utf8'));

let Config = {
    feedDefaults: feedDefaults,
    imagesUri: path.join(__dirname, '/images/'), // eslint-disable-line
    feedsUri: path.join(__dirname, '/feeds/'), // eslint-disable-line
    episodesUri: path.join(__dirname, '/episodes/'), // eslint-disable-line
};

for (var prop in config) Config[prop] = config[prop];

module.exports = Config; // eslint-disable-line
