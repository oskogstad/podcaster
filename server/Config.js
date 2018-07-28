const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const feedDefaults = JSON.parse(fs.readFileSync('feed_defaults.json', 'utf8'));

let Config = {
    feedDefaults: feedDefaults
};

for (var prop in config) Config[prop] = config[prop];

module.exports = Config; // eslint-disable-line
