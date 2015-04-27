#!/usr/bin/env node

var searchServer = require('eea-searchserver')
var express = require('express');
var morgan = require('morgan');
var nconf = require('nconf');
var crontab = require('node-crontab');
var path = require('path');

var routes = require('./routes');
var managementCommands = require('./management/commands');

var app = express();

var env = process.env.NODE_ENV || 'dev'

app.set('nconf', nconf);
app.set('managementCommands', managementCommands);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Skip non-error codes in production
var prodLogOpt = {'skip': function(req, res) { return res.statusCode < 400; }};
var loggerFormat = env === 'dev' ? 'dev' : 'combined';
var loggerOpt =    env === 'dev' ? {} : prodLogOpt;
var logger = morgan(loggerFormat, loggerOpt);
app.use(logger);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', searchServer.middleware.templateRequired, routes.index);
app.get('/index', searchServer.middleware.templateRequired, routes.index);
app.get('/api', searchServer.routes.elasticProxy);
app.get('/invalidate_templates', searchServer.routes.invalidateTemplates);

function checkError(err) {
    if (err) {
        process.stderr.write(err.message + '\n\n');
        process.exit(2);
    }
}

// Schedule sync as expressed in env variables
var syncCrontab = process.env.SYNC_CRONTAB
if (syncCrontab) {
    crontab.scheduleJob(syncCrontab, managementCommands.sync);
    console.log("Enabled sync crontab job: " + syncCrontab);
}

searchServer.Server(app, __dirname + '/settings.json', function(err, srv) {
    checkError(err);
    elastic = srv.nconf.get('elastic');
    console.log("Running with Elastic Backend URL: http://" +
                elastic.host + ":" + elastic.port + elastic.path +
                elastic.index + "/" + elastic.type);
    console.log("");

    srv.run(process.argv[2], process.argv.slice(3), function(err, srv) {
        checkError(err);
        console.log("Ran command: " + process.argv[2]);
    });
});
