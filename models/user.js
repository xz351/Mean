const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = mongoose.Schema({
    "name": {
        type: String,
    },
    "email": {
        type: String,
        unique: true,
        required: true
    },
    "username": {
        type: String,
        unique: true,
        required: true
    },
    "password": {
        type: String,
        required: true
    }
});
UserSchema.plugin(uniqueValidator);

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
}

module.exports.getUserByUsername = function(username, callback){
    const query = {username: username};
    User.findOne(query,callback);
}

module.exports.emailChecking = function (email, callback){
    const query = {email: email};
    User.findOne(query,callback);
}

module.exports.addUser = function(newUser, callback){
    bcrypt.genSalt(10, (err,salt) => {
        bcrypt.hash(newUser.password, salt, (err,hash) => {
            if(err) throw (err);
            newUser.password=hash;
            newUser.save(callback);
        })
    })
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}