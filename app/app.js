#!/usr/bin/env node

/**
 * Module dependencies.
 */

var path = require('path');
var searchServer = require('eea-searchserver')
var builtinRoutes = require('./routes/eeasearch');
var managementCommands = require('./commands/eeasearch');

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
    dataMapping: 'config/dataMapping.json',
    endpoint: 'http://semantic.eea.europa.eu/sparql',
  },
  customResourcesPath: ['code/config/public']
}
searchServer.Helpers.SimpleStart(options)


exports.fieldsMapping = function(next){
    next(require(path.join(__dirname, "/config/mapping.json")));
}
