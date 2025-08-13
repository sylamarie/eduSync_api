const express = require('express');
const dotenv = require('dotenv');

// Silence dotenv console output during config
(() => {
  const originalConsoleLog = console.log;
  try {
    console.log = () => {};
    dotenv.config();
  } finally {
    console.log = originalConsoleLog;
  }
})();

const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const app = express();
// Trust proxy for secure connections
app.set('trust proxy', true);

const passport = require('passport');
const session = require('express-session');
const GithubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

const port = process.env.PORT || 3000;

// Middleware
app
  .use(bodyParser.json())
  .use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers', 
      'Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods', 
      'POST, GET, PUT, PATCH, OPTIONS, DELETE'
    );
    next();
  })
  .use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    origin: '*'
  }));

// 🔹 Swagger UI (runtime protocol/host detection)
app.use('/api-docs', require('./routes/swagger.js'));

// 🔹 Main routes
app.use("/", require('./routes/index.js'));

// GitHub OAuth setup
passport.use(new GithubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);   
});

// OAuth routes
app.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/', session: false }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
  }
);

// Simple GET logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out.' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// MongoDB init and server listen
mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port, () => {
      console.log(`EduSync API server listening at http://localhost:${port}`);
    });
  }
});