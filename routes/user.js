const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const asyncWrap = require('../utils/asyncWrap.js');
const passport = require('passport');
const {saveRedirectUrl} = require('../middleware.js');
const UserController = require('../controller/user.js');


router.get('/signup',UserController.signupForm);

router.post('/signup',asyncWrap(UserController.signUp));

router.get('/login',UserController.loginForm)

//passport provides an authenticate() funtion, which is used as route middleware to atuthenticate requests
router.post('/login', saveRedirectUrl,
    passport.authenticate('local',{failureRedirect: '/login', failureFlash: true}), 
    UserController.login);

router.get('/logout',UserController.logout);




module.exports = router;