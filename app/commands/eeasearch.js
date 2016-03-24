var path = require('path');

function getOptions() {
    var nconf = require('nconf')
    var elastic = nconf.get()['elastic'];
    return {
        'es_host': elastic.host + ':' + elastic.port + elastic.path
    };
}

function getIndexFiles(settings) {

  var analyzers = require(path.join(settings.app_dir, settings.extraAnalyzers));
  var filters = require(path.join(settings.app_dir, settings.filterAnalyzers));
  var datamappings = require(path.join(settings.app_dir, settings.dataMapping));
  var riverconfig = require(path.join(settings.app_dir, '/config/riverconfig.json'));

  var mappings = {
    'settings': {
        'analysis': {
            'filter': filters,
            'analyzer': analyzers
        }
    },
    'mappings': {
        'resource': {
            'properties': datamappings
        }
    }
  };

  return {
    analyzers: mappings,
    syncReq: {
        'type': 'eeaRDF',
        'eeaRDF': {
            'endpoint': settings.endpoint,
            'indexType': 'sync',
            'syncConditions': riverconfig.syncConditions.join(''),
            'graphSyncConditions': 'FILTER (str(?graph) = concat(str(?resource), \'/@@rdf\'))',
            'syncTimeProp': riverconfig.syncTimeProp,
            'startTime': '',
            'queryType': riverconfig.queryType,
            'proplist': riverconfig.proplist,
            'listtype': riverconfig.listtype,
            'normProp': riverconfig.normProp,
            'normMissing': riverconfig.normMissing,
            'blackMap': riverconfig.blackMap,
            'whiteMap': riverconfig.whiteMap,
            'normObj': riverconfig.normObj,
            'syncOldData': true
        }
    }
  }
}

var callback = function(text) {
    return function(err, statusCode, header, body) {
        console.log(text);
        if (err) {
            console.log(err.message);
        } else {
            console.log('  Successfuly ran query');
            console.log('  ResponseCode: ' + statusCode);
            console.log('  ' + body);
        }
    };
}

function removeRiver() {
    var esAPI = require('eea-searchserver').esAPI;
    new esAPI(getOptions())
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .execute();
}

function removeData(settings) {
    var esAPI = require('eea-searchserver').esAPI;
    var config = getIndexFiles(settings);
    var elastic = require('nconf').get()['elastic'];
    new esAPI(getOptions())
        .DELETE(elastic.index, callback('Deleting index! (if it exists)'))
        .execute();
}

function syncIndex(settings) {
    var esAPI = require('eea-searchserver').esAPI;
    var config = getIndexFiles(settings);
    new esAPI(getOptions())
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch/_meta', config.syncReq, callback('Adding river!'))
        .execute();
}

function reindex(settings) {
    var esAPI = require('eea-searchserver').esAPI;
    var elastic = require('nconf').get()['elastic'];
    var config = getIndexFiles(settings);

    new esAPI(getOptions())
        .DELETE(elastic.index, callback('Deleting index! (if it exists)'))
        .PUT(elastic.index, config.analyzers,
             callback('Setting up new index and analyzers'))
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch/_meta', config.syncReq, callback('Adding river back'))
        .execute();
}

function createIndex(settings) {
    var esAPI = require('eea-searchserver').esAPI;
    var elastic = require('nconf').get()['elastic'];
    var config = getIndexFiles(settings);

    new esAPI(getOptions())
        .PUT(elastic.index, config.analyzers,
             callback('Setting up new index and analyzers'))
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch/_meta', config.syncReq, callback('Adding river back'))
        .execute();
}

function showHelp() {
    console.log('List of available commands:');
    console.log(' runserver: Run the app web server');
    console.log('');
    console.log(' sync: Get changes from the semantic DB into the ES index');
    console.log(' create_index: Setup Elastic index and trigger indexing');
    console.log(' reindex: Remove data and recreate index');
    console.log('');
    console.log(' remove_data: Remove the ES index of this application');
    console.log(' remove_river: Remove the running river indexer if any');
    console.log('');
    console.log(' help: Show this menu');
    console.log('');
}

module.exports = {
    'sync': syncIndex,
    'remove_river': removeRiver,
    'remove_data': removeData,
    'reindex': reindex,
    'create_index': createIndex,
    'help': showHelp
}
