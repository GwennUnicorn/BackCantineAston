const express       = require('express');
const bodyParser    = require('body-parser');
const _             = require('lodash');
const { ObjectID }  = require('mongodb');
const { mongoose }  = require('./db/mongoose');

var app = express();

// middleware décodant le json inclu dans le body des  requêtes
app.use(bodyParser.json());

// Load and initialize the controllers.
require('./lib/controllersLoader')(app);

app.get('/', (req, res) => {
    res.status(200).send('Server listening !')
})

// déclaration du dossier public contenant fichiers statiques
// exemple: http://localhost:8000/pizza.jpg
app.use(express.static(__dirname + '/public'));

app.listen(8000, () => {
    console.log('Listening on port 8000');
    
})