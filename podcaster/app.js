const mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    express = require('express'),
    multer = require('multer'),
    path = require('path'),
    CreatePodcast = require('./PodcastGenerator'),
    CreateEpisode = require('./EpisodeGenerator'),
    Podcast = require('./models/podcast'),
    Episode = require('./models/episode'),
    Config = require('./Config'),
    User = require('./models/user'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    ExpressSession = require('express-session');

const app = express(),
    uploadImage = multer({ dest: Config.localImagesUri }).single(
        'podcast-image'
    ),
    uploadEpisode = multer({ dest: Config.localEpisodesUri }).single(
        'podcast-episode'
    );

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views')); // eslint-disable-line

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    ExpressSession({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/images/', express.static(Config.localImagesUri));
app.use('/feeds/', express.static(Config.localFeedsUri));
app.use('/episodes/', express.static(Config.localEpisodesUri));

mongoose.connect(
    Config.databaseUri,
    { useNewUrlParser: true },
    err => {
        if (err) console.log(`Failed connecting to mongoDB:\n${err}`);
        User.findOne({ username: 'admin' }, (err, admin) => {
            if (admin) return;
            User.register(
                new User({ username: 'admin', isAdmin: true }),
                'admin',
                err => {
                    if (err) console.log(err);
                    else console.log('admin user created');
                }
            );
        });
    }
);

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }

    res.redirect('/');
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.get('/login', (req, res) => {
    res.render('login');
});

app.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    (req, res) => {
        res.send(req.user.id);
    }
);

app.get('/', isLoggedIn, (req, res) => {
    Podcast.find({}, (err, podcasts) => {
        if (err) res.send(err);
        else res.render('podcasts', { podcasts: podcasts });
    });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.get('/adduser', isAdmin, (req, res) => {
    res.render('adduser');
});

app.post('/adduser', isAdmin, (req, res) => {
    User.register(
        new User({ username: req.body.username, isAdmin: false }),
        req.body.password,
        err => {
            if (err) {
                console.log(err);
                res.send(err);
            } else res.redirect('/');
        }
    );
});

app.get('/podcast/:pid', isLoggedIn, (req, res) => {
    Podcast.findOne({ pid: req.params.pid }, (err, podcast) => {
        if (err) res.send(err);
        else res.render('podcast', { podcast: podcast });
    });
});

app.get('/addpodcast', isLoggedIn, (req, res) => {
    res.render('addpodcast');
});

app.get('/addepisode', isLoggedIn, (req, res) => {
    res.render('addepisode');
});

app.post('/addpodcast', isLoggedIn, uploadImage, (req, res) => {
    let podcast = CreatePodcast(req);

    Podcast.create(podcast, (err, result) => {
        if (err) res.send(err);
        else res.render('podcast', { podcast: result });
    });
});

app.post('/addepisode', isLoggedIn, uploadEpisode, (req, res) => {
    let episode = CreateEpisode(req);

    Episode.create(episode, (err, result) => {
        if (err) res.send(err);
        else res.render('episode', { episode: result });
    });
});

app.listen(Config.port, () => console.log(`Listening at ${Config.port}`));
