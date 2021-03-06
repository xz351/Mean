const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');

// Register
router.post('/register', (req,res,next) =>{
    let newUser = new User({
        name : req.body.name,
        email : req.body.email,
        username : req.body.username,
        password : req.body.password
    });

    User.addUser(newUser, (err,user) => {
        if(err){
            if(err.errors.username){
            res.json({success: false, msg: 'This username is already used'});
            }
            else if (err.errors.email){
                res.json({success: false, msg: 'This email is already used'});
            }
            else{
                res.json({success: false, msg: 'Failed to add user'});
            }
        } else {
            res.json({success: true, msg: 'The user is added'});
        }
    })
})

// Authenticate
router.post('/authenticate', (req,res,next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({success:false, msg: 'User not found'});
        }
    
    User.comparePassword(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
            const token = jwt.sign(user.toJSON(), config.secret, {
                expiresIn: 604800 // 1 week
            });

            res.json({
                success:true,
                token: 'JWT '+token,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email
                }
            });
        } else{
            return res.json({success:false, msg:'Wrong password'});
        }
    });

})
})

// Profile
router.get('/profile', passport.authenticate('jwt',{session:false}),(req,res,next) =>{
    res.json({user: req.user});
})

// Validate
router.post('/validate', (req,res,next) =>{
    const type = req.body.type;

    switch(type) {
        case 'email': {
            const email = req.body.value;
            User.emailChecking(email, (err, user) => {
                if(err) throw err;
                if(user){
                    return res.json({existing:true});
                }
                else{
                    return res.json({existing:false});
                }
            });
            break;
        }
        case 'username':{
            const username = req.body.value;
            User.getUserByUsername(username, (err, user) => {
                if(err) throw err;
                if(user){
                    return res.json({existing:true});
                }
                else{
                    return res.json({existing:false});
                }
            });
            break;
        }
    }
})

module.exports = router;
