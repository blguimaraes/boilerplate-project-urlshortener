require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const { nextTick } = require('process');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Parsing post content
app.use('/api/shorturl/', express.json());
app.use('/api/shorturl/', express.urlencoded({extended: true}));

var shortenedUrl = {};

// My url shortener API endpoint
app.post('/api/shorturl/', function(req, res){  
  var postUrl = req.body.url;
  var checkHostName;
  
  if ( postUrl.substring(0, 8) == 'https://'){
    checkHostName = postUrl.slice(8);
  } else if (postUrl.substring(0, 7) == 'http://') {
    checkHostName = postUrl.slice(7);
  } else {
    res.json({ error: 'invalid url' });
  };

  dns.lookup(checkHostName.substring(0, checkHostName.indexOf('/')), function(err){
    if(err && err.code == 'ENOTFOUND'){
      res.json({ error: 'invalid url' });
    }
    else {
      shortenedUrl = {
        original_url : postUrl,
        short_url : Math.floor(Math.random() * 1000)
        };
      res.json(shortenedUrl);
      return shortenedUrl;
    };
  });
});

app.get('/api/shorturl/:short_url', function(req, res, next){
  async () => {
    if( req.params.short_url != shortenedUrl.short_url ){
    res.redirect('/');
  }};
  next();
  }, function(req, res) {
    res.redirect(301, shortenedUrl.original_url);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
