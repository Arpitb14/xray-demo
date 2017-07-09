const express = require("express")
const AWSXRay = require('aws-xray-sdk');
const http = require('http');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();

// Models
const Account = require('./models/account');


AWSXRay.captureHTTPsGlobal(require('http'));

app.use(AWSXRay.express.openSegment('MyApp'));
app.use(express.static('assets'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');

// passport config
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


if (process.env.MONGO_IP) {
  let IP = process.env.MONGO_IP
} else {
  let IP = 'localhost'
}

mongoose.connect('mongodb://' + IP + '/passport');


app.post('/login', passport.authenticate('local'), (req, res) => {
    res.redirect('/');
});

app.get('/register', (req, res) => {
    res.render('register', { error : null });
});

app.post('/register', (req, res) => {
    Account.register(new Account({ username : req.body.username }), req.body.password, (err, account) => {
        if (err) {
            return res.render('register', {error: err.message, account : account });
        }

        passport.authenticate('local')(req, res,  () => {
            res.redirect('/');
        });
    });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// example basic route
app.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

app.get('/', (req, res) => {
    res.render('index', { user : req.user });
});

app.get('/login', (req, res) => {
    res.render('login', { user : req.user });
});


// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(AWSXRay.express.closeSegment());

app.listen(3000, () => {
  console.log('Running => 3000')
})
