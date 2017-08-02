#!/usr/bin/env node

/**
 * Module dependencies.
 */

var path = require('path');
var searchServer = require('eea-searchserver')
var builtinRoutes = require('./routes/eeasearch');
//var builtinRoutes = searchServer.builtinRoutes;
var managementCommands = require('./commands/eeasearch');
var fs = require('fs');

options = {
  app_dir: __dirname,
  views: __dirname + '/views',
  settingsFile: __dirname + '/config/settings.json',
  routes: {
    routes: builtinRoutes
  },
  indexing:{
    managementCommands: managementCommands,
    extraAnalyzers: 'config/analyzers.json',
    filterAnalyzers: 'config/filters.json',
    dataMapping: 'config/mapping.json',
    endpoint: 'http://semantic.eea.europa.eu/sparql',
  },
  customResourcesPath: ['code/config/public']
}
searchServer.Helpers.SimpleStart(options)


exports.relevanceSettings = function(next){
    var relevancePath = path.join(__dirname, "/config/relevance.json");
    if (fs.existsSync(relevancePath)) {
        next(require(relevancePath));
    }
    else{
        next({});
    }
}

exports.fieldsMapping = function(next){
    next(require(path.join(__dirname, "/config/facets.json")));
}
