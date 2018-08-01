const mongoose = require('mongoose');

const PodcastSchema = new mongoose.Schema({
    title: String,
    pid: String,
    keywords: String,
    pubDate: String,
    description: String,
    subtitle: String,
    lastBuildDate: String,
    feedUri: String,
    imageUri: String,
    author: String
});

module.exports = mongoose.model('Podcast', PodcastSchema); // eslint-disable-line