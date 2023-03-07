'use strict';

require('dotenv').config()
var express = require('express');
const bodyParser = require('body-parser');
const queryParser = require('query-parser-express');
var cors = require('cors');

var app = express();

app.use(cors());

// set the view engine to ejs
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// query parser
app.use(queryParser(
    {
        parseBoolean: true, // default true
        parseNumber: true // default true
    }
));

// set the view engine to ejs
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/static', express.static('statics'));

// index page
app.get('/', function(req, res) {
    let tokens = [
        'wETH',
        'wBTC'
    ]
    res.render('pages/index', {
        title: 'EVM',
        tokens: tokens
    });
});

// about page
app.get('/about', function(req, res) {
  res.render('pages/about');
});

let port = process.env.PORT || 8080;

app.listen(port);
console.log('Initiating Faucet on', port);
