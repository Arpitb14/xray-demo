const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Models
const Account = require('../models/account');

// Controllers
const Message = require('../controllers/message');
const S3 = require('../controllers/s3');

// Passport config
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

let routes = function(User){

    let Router = express.Router();

    Router.route('/')
        .get((req, res) => {
            res.render('index', { user : req.user });
        })

    Router.route('/login')
        .get((req, res) => {
            res.render('login', { user : req.user });
        })
        .post(passport.authenticate('local'), (req, res) => {
            res.redirect('/');
        })

    Router.route('/logout')
        .get((req, res) => {
            req.logout();
            res.redirect('/');
        })

    Router.route('/register')
        .get((req, res) => {
            res.render('register', { error : null });
        })
        .post((req, res) => {
            Account.register(new Account({ username : req.body.username }), req.body.password, (err, account) => {
                if (err) {
                    return res.render('register', {error: err.message, account : account });
                }

                passport.authenticate('local')(req, res,  () => {
                    res.redirect('/');
                });
            });
        })

    Router.route('/upload')
        .get((req, res) => {
            res.render('upload', { user : req.user });
        })
        .post(S3.array('upl', 1), (req, res) => {
            res.redirect('/');
        })

    Router.route('/send')
        .post((req, res) => {
            Message.sendMessage(req.body.name, req.body.email, req.body.message, "https://sqs.eu-west-1.amazonaws.com/786642626264/flynn-test")
            res.redirect('/');
        })

    return Router;
};

module.exports = routes;
