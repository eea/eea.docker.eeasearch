var path = require('path');

function getOptions() {
    var nconf = require('nconf')
    var elastic = nconf.get()['elastic'];
    return {
        'es_host': elastic.host + ':' + elastic.port + elastic.path
    };
}

function getIndexFiles(settings, riverconfig) {

  var analyzers = require(path.join(settings.app_dir, settings.extraAnalyzers));
  var filters = require(path.join(settings.app_dir, settings.filterAnalyzers));
  var datamappings = require(path.join(settings.app_dir, settings.dataMapping));
//  var riverconfig = require(path.join(settings.app_dir, '/config/riverconfig_1.json'));
//  var riverconfig_2 = require(path.join(settings.app_dir, '/config/riverconfig_2.json'));

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
//            'startTime': '1970-01-01T00:00:00',
            'startTime': '',
            'queryType': riverconfig.queryType,
            'proplist': riverconfig.proplist,
            'listtype': riverconfig.listtype,
            'normProp': riverconfig.normProp,
            'normMissing': riverconfig.normMissing,
            'blackMap': riverconfig.blackMap,
            'whiteMap': riverconfig.whiteMap,
            'normObj': riverconfig.normObj,
            'syncOldData': true,
            'domain': 'eea1'
//            'syncOldData': false
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
    var riverconfig = require(path.join(settings.app_dir, '/config/riverconfig_1.json'));
    var config = getIndexFiles(settings, riverconfig);
    var elastic = require('nconf').get()['elastic'];
    new esAPI(getOptions())
        .DELETE(elastic.index, callback('Deleting index! (if it exists)'))
        .execute();
}

function syncIndex(settings) {
    var esAPI = require('eea-searchserver').esAPI;
    var elastic = require('nconf').get()['elastic'];
    var riverconfig = require(path.join(settings.app_dir, '/config/riverconfig_1.json'));
    var config = getIndexFiles(settings, riverconfig);
    new esAPI(getOptions())
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch/_meta', config.syncReq, callback('Adding river!'))
        .PUT(elastic.index + '/status/last_update', {'updated_at': Date.now() }, callback('River updated'))
        .execute();
}

function reindex(settings) {
    var esAPI = require('eea-searchserver').esAPI;
    var elastic = require('nconf').get()['elastic'];
    var riverconfig = require(path.join(settings.app_dir, '/config/riverconfig_1.json'));
    var config = getIndexFiles(settings, riverconfig);

    new esAPI(getOptions())
        .DELETE(elastic.index, callback('Deleting index! (if it exists)'))
        .PUT(elastic.index, config.analyzers,
             callback('Setting up new index and analyzers'))
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch/_meta', config.syncReq, callback('Adding river back'))
        .PUT(elastic.index + '/status/last_update', {'updated_at': Date.now() }, callback('River updated'))
        .execute();
}

function createIndex(settings) {
    var esAPI = require('eea-searchserver').esAPI;
    var elastic = require('nconf').get()['elastic'];
    var riverconfig_1 = require(path.join(settings.app_dir, '/config/riverconfig_1.json'));
    var riverconfig_2 = require(path.join(settings.app_dir, '/config/riverconfig_2.json'));
    var config_1 = getIndexFiles(settings, riverconfig_1);
    var config_2 = getIndexFiles(settings, riverconfig_2);
//    config_2.syncReq.syncOldData = false;
    config_2.syncReq.domain = 'eea2';

    new esAPI(getOptions())
        .PUT(elastic.index, config_1.analyzers,
             callback('Setting up new index and analyzers'))
        .DELETE('_river/eeaSearch1', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch1/_meta', config_1.syncReq, callback('Adding river back'))
        .DELETE('_river/eeaSearch2', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch2/_meta', config_2.syncReq, callback('Adding river back'))
        .PUT(elastic.index + '/status/last_update', {'updated_at': Date.now() }, callback('River updated'))
        .execute();
}

function showHelp() {
    console.log('List of available commands:');
    console.log(' runserver: Run the app web server');
    console.log('');
    console.log(' sync_index: Get changes from the semantic DB into the ES index');
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
    'sync_index': syncIndex,
    'remove_river': removeRiver,
    'remove_data': removeData,
    'reindex': reindex,
    'create_index': createIndex,
    'help': showHelp
}
