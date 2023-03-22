'use strict';

require('dotenv').config()
var express = require('express');
const bodyParser = require('body-parser');
const queryParser = require('query-parser-express');
var cors = require('cors');
var { requestFunds, getTokenData } = require('./evm');

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

const faucets = require('./contracts/faucets.json');

app.get('/', function(req, res) {
    let tokens = Object.keys(faucets);
    res.render('pages/index', {
        title: 'EVM',
        tokens: tokens
    });
});

// app.get('/about', function(req, res) {
//   res.render('pages/about');
// });

app.post('/fund', async function(req, res) {
    let responseData = await requestFunds(req.body.token, req.body.address);
    res.status(200).send(responseData);
});

app.get('/token', async function(req, res) {
    let responseData = await getTokenData(req.query.key);
    res.status(200).send(responseData);
});

let port = process.env.PORT || 8080;

app.listen(port);
console.log('Initiating Faucet on', port);
