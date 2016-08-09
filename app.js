'use strict';

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    bcrypt = require('bcrypt'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    morgan = require('morgan'),
    port = process.env.PORT || 3000,
    path = require('path'),
    controllers = require(path.join(__dirname, 'controllers')),
    models = require(path.join(__dirname, 'models')),
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
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(room, done) {
    done(null, room);
});

passport.deserializeUser(function(room, done) {
    done(null, room);
});

passport.use(new LocalStrategy(
    function(name, password, done) {
        models.rooms.findOne({
            where: {
                'name': name
            },
            attributes: ['salt', 'password', 'id', 'name']
        }).then(function(room) {
          console.log(room);
            if (!room) {
                return done(null, false, {
                    message: 'Incorrect credentials.'
                });
            }
            bcrypt.hash(password, room.salt, function(err, hash) {
                if (err) {
                    done(null, false, err);
                }
                if (hash === room.password) {
                    return done(null, {
                        id: room.id,
                        name: name
                    });
                }
                return done(null, false, {
                    message: 'Incorrect credentials.'
                });
            });
        });
    }
));

// Logging
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}


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


// Init - sync database and create default user if none exists
models.sequelize.sync().then(function() {
    app.listen(port, function() {
        console.log('Listening on port ' + port);
    });
}).catch(function(err) {
    console.error(err);
});
