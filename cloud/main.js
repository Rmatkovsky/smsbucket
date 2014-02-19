"use strict";

var express    = require('express');
var _          = require('underscore');

var urls       = require('cloud/urls').urls;


var app = express();
app.set('views', 'cloud/html');
app.set('view engine', 'ejs');

// All URLs specified in cloud/urls.js will cause backend.html to be served
_.each(urls, function (_, url) {
    app.get('/' + url, function (request, response) {
        response.set('Content-Type', 'text/html');
        response.render('base.ejs');
    });
});

app.listen();
