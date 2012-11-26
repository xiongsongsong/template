/**
 * Created with JetBrains WebStorm.
 * User: xiongsongsong
 * Date: 12-11-25
 * Time: 下午12:55
 * To change this template use File | Settings | File Templates.
 */

'use strict';

var express = require('express');
var app = express();

// Configuration
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret:"keyboard cat" }));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/assets'));
    app.use(express.static(__dirname + '/cache'));
    app.use(express.static(__dirname + '/demo'));
    app.use(express.static(__dirname + '/web'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

require('./routes').init(app);

app.listen(8000);
