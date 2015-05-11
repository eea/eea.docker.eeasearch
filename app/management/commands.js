var esAPI = require('eea-searchserver').esAPI;

var config = require('./river_config/config.js');
var analyzers = require('./river_config/analyzers.js');

function getOptions() {
    var nconf = require('nconf')
    var elastic = nconf.get()['elastic'];
    return {
        'es_host': elastic.host + ':' + elastic.port + elastic.path
    };
}

var syncReq = {
    'type': 'eeaRDF',
    'eeaRDF': {
        'endpoint': config.endpoint,
        'indexType': 'sync',
        'syncConditions': config.syncConditions,
        'graphSyncConditions': 'FILTER (str(?graph) = concat(str(?resource), \'/@@rdf\'))',
        'syncTimeProp': config.syncTimeProp,
        'startTime': '',
        'queryType': config.queryType,
        'proplist': config.proplist,
        'listtype': config.listtype,
        'normProp': config.normProp,
        'normMissing': config.normMissing,
        'blackMap': config.blackMap,
        'whiteMap': config.whiteMap,
        'normObj': config.normObj,
        'syncOldData': true
    }
};

var analyzers = analyzers.mappings;

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

function syncIndex() {
    new esAPI(getOptions())
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch/_meta', syncReq, callback('Adding river!'))
        .execute();
}

function removeRiver() {
    new esAPI(getOptions())
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .execute();
}

function removeData() {
    var elastic = require('nconf').get('elastic');
    new esAPI(getOptions())
        .DELETE(elastic.index, callback('Deleting index! (if it exists)'))
        .execute();
}

function reindex() {
    var elastic = require('nconf').get('elastic');

    new esAPI(getOptions())
        .DELETE(elastic.index, callback('Deleting index! (if it exists)'))
        .PUT(elastic.index, analyzers,
             callback('Setting up new index and analyzers'))
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch/_meta', syncReq, callback('Adding river back'))
        .execute();
}

function createIndex() {
    var elastic = require('nconf').get('elastic');

    new esAPI(getOptions())
        .PUT(elastic.index, analyzers,
             callback('Setting up new index and analyzers'))
        .DELETE('_river/eeaSearch', callback('Deleting river! (if it exists)'))
        .PUT('_river/eeaSearch/_meta', syncReq, callback('Adding river back'))
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
