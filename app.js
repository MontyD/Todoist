'use strict';

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    morgan = require('morgan'),
    port = process.env.PORT || 3000,
    path = require('path'),
    socketsRouting = require(path.join(__dirname, 'sockets')),
    controllers = require(path.join(__dirname, 'controllers')),
    models = require(path.join(__dirname, 'models')),
    authentication = require(path.join(__dirname, 'middlewares', 'authentication.js')),
    config = require(path.join(__dirname, 'config.js'));

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 3200000
    }
}));


// Passport setup
app.use(passport.initialize({userProperty: 'room'}));
app.use(passport.session());

passport.serializeUser(function(room, done) {
    done(null, room);
});

passport.deserializeUser(function(room, done) {
    done(null, room);
});

passport.use(authentication);

// Logging
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Add io to res
app.use(function(req, res, next){
  res.io = io;
  next();
});

// socket routing
io.on('connection', socketsRouting);

// Routing - in controllers
app.use(controllers);


// Error handling

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// development error handler
if (config.env === 'development') {
    app.use(function(err, req, res, next) {
        if (err.status === 401) {
            res.status(401);
            if (/json/gi.test(req.get('accept'))) {
                return res.send('Unauthorised');
            }
            return res.render('login', {
                originalURL: req.originalUrl
            });
        }

        console.error(err);
        res.status(err.status || 500);
        if (/json/gi.test(req.get('accept'))) {
            res.json(err.message);
        } else {
            res.render('error', {
                message: err.message,
                error: err
            });
        }
    });
}

// production error handler
app.use(function(err, req, res, next) {
    if (err.status === 401) {
        res.status(401);
        if (/json/gi.test(req.get('accept'))) {
            return res.send('Unauthorised');
        }
        return res.render('login', {
            originalURL: req.originalUrl
        });
    }
    console.error(err);
    res.status(err.status || 500);
    if (/json/gi.test(req.get('accept'))) {
        res.json(err.message);
    } else {
        res.render('error', {
            message: err.message,
            error: {}
        });
    }
});


// Init - sync database
models.sequelize.sync().then(function() {
    server.listen(port, function() {
        console.log('Listening on port ' + port);
    });
}).catch(function(err) {
    console.error(err);
    process.exit(1);
});
