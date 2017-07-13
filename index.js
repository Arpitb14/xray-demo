const express = require("express")
const AWSXRay = require('aws-xray-sdk');
const http = require('http');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();

// Capture all HTTP methods Outbound and inbound
AWSXRay.captureHTTPsGlobal(require('http'));

// Middleware
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

// View Engine
app.set('view engine', 'ejs');

// Mongo Connection (Localhost or AWS)
if (process.env.MONGO_IP) {
  var IP = process.env.MONGO_IP
} else {
  var IP = 'localhost'
}

// Mongo Connect
mongoose.connect('mongodb://' + IP + '/passport');

// Main Router
const User = require('./models/account');

// Open Segment
app.use(AWSXRay.express.openSegment('front-end'));

// Require/Execute routes
Router = require('./routes/routes')(User);

// Calling main Router
app.use('/', Router);


// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Close Segment
app.use(AWSXRay.express.closeSegment());

app.listen(3000, () => {
  console.log('Running => 3000')
})
