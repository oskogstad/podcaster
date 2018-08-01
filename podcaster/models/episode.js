const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema({
    eid: String,
    feedUri: String,
    description: String,
    title: String,
    summary: String,
    subtitle: String,
    episodeUri: String,
    duration: String,
    pubDate: String,
    author: String
});

module.exports = mongoose.model('Episode', EpisodeSchema); // eslint-disable-line
