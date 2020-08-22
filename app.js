const path = require('path');
const express = require('express');
const GetFiles = require('./GetFiles.json');

const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// Set View Engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// For Static Files that are used by client side views
app.use(
  '/client',
  express.static(path.join(__dirname, 'public'), {
    lastModified: false,
    maxAge: '1y',
  })
);

// For Static Files that are stored on the server and not used for client side views
app.use(
  '/static',
  express.static(path.join(__dirname, 'static'), {
    lastModified: false,
    maxAge: '1y',
  })
);

app.get('/info', (req, res) => {
  res.status(200).json({
    status: 'success',
    name: 'Mubahsir Hassan',
    info:
      'This is a boilerplate project for NodeJS, Express, Webpack and Pug(view engine).',
    routes: ['/home', '/static/nodejs.3dc364b8e9beb3561620274aea4f0844.svg'],
  });
});

app.get('/', (req, res) => {
  res.render('index/index', {
    // This is must for injecting client side resources like js files, icons, css files etc
    assets: GetFiles.files.index.assets,
  });
});

module.exports = app;
