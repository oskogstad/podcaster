const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({ isAdmin: Boolean });

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema); // eslint-disable-line