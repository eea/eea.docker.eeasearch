var dateFormat = require('dateformat')
var path = require('path');

function getOptions() {
    var nconf = require('nconf')
    var elastic = nconf.get()['elastic'];
    return {
        'es_host': elastic.host + ':' + elastic.port + elastic.path
    };
}

function getIndexFiles(settings, elastic, riverconfig, cluster_id, cluster_name) {
  var analyzers = require(path.join(settings.app_dir, settings.extraAnalyzers));
  var filters = require(path.join(settings.app_dir, settings.filterAnalyzers));
  var datamappings = require(path.join(settings.app_dir, settings.dataMapping));

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

  if ((cluster_id !== undefined) && (cluster_id !== "")){
      riverconfig.proplist.push("cluster_id");
      riverconfig.normMissing["cluster_id"] = cluster_id;
  }
  if ((cluster_name !== undefined) && (cluster_name !== "")){
      riverconfig.proplist.push("cluster_name");
      riverconfig.normMissing["cluster_name"] = cluster_name;
  }
  if (riverconfig.graphSyncConditions === undefined){
    riverconfig.graphSyncConditions = [];
  }
  return {
    analyzers: mappings,
    syncReq: {
        'type': 'eeaRDF',
        'eeaRDF': {
            'endpoint': settings.endpoint,
            'indexType': 'sync',
            'syncConditions': riverconfig.syncConditions.join(''),
            'graphSyncConditions': riverconfig.graphSyncConditions.join(''),
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
            'syncOldData': true,
            'addCounting': elastic.enableValuesCounting
        },
        'index': {
            'index': elastic.index,
            'type': elastic.type,
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
    var river_configs = require('nconf').get()['river_configs'];
    var esQuery = new esAPI(getOptions());
    for (var i = 0; i < river_configs.configs.length; i++){
        var river_name = "_river/" + river_configs.configs[i].id;
        esQuery
            .DELETE(river_name, callback('Deleting river! (if it exists)'));
    }
    esQuery.execute();

}

function removeData(settings) {
    var esAPI = require('eea-searchserver').esAPI;
    var elastic = require('nconf').get()['elastic'];
    new esAPI(getOptions())
        .DELETE(elastic.index, callback('Deleting index! (if it exists)'))
        .execute();
}

function checkIfIndexing(settings){
    var request = require('sync-request');
    var esAPI = require('eea-searchserver').esAPI;
    var elastic = require('nconf').get()['elastic'];
    var rivers = 'http://' + elastic.host + ':' + elastic.port + elastic.path + '/_river/_search'
    qs = {
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "index.index": elastic.index
                        }
                    }
                ]
            }
        }
    };
    var river_count = 0;
    try {
        res = request('GET', rivers, {q:qs});
        var res_json = JSON.parse(res.getBody('utf8'));
        river_count = res_json.hits.total;
    } catch(e) {
        console.log("Couldn't get the number of rivers");
    }
    if (river_count !== 0){
        return true;
    }
    return false;
}

function createIndex(settings) {
    if (checkIfIndexing(settings)){
        console.log("Indexing already in progress. If you want to start it again, use the reindex command, or wait until the indexing is done.");
        return;
    }

    var esAPI = require('eea-searchserver').esAPI;
    var elastic = require('nconf').get()['elastic'];
    var river_configs = require('nconf').get()['river_configs'];


    var request = require('sync-request');
    var dateFormat = require('dateformat');
    var indexed_url = 'http://' + elastic.host + ':' + elastic.port + elastic.path + elastic.index + '/status/last_update';
    startTime = "1970-01-01T00:00:00";
    try {
        res = request('GET', indexed_url);
        var res_json = JSON.parse(res.getBody('utf8'));
        var creation_date_stamp = res_json._source.updated_at;
        var creation_date = new Date(creation_date_stamp);
        startTime = dateFormat(creation_date, "yyyy-mm-dd'T'HH:MM:ss");
    } catch(e) {
        console.log('Index is missing');
    }

    var esQuery = new esAPI(getOptions());
    if (settings.remove_all){
        startTime = "1970-01-01T00:00:00";
        for (var i = 0; i < river_configs.configs.length; i++){
            var river_name = "_river/" + river_configs.configs[i].id;
            esQuery.DELETE(river_name, callback('Deleting river! (if it exists)'));
        }
        esQuery.DELETE(elastic.index, callback('Deleting index! (if it exists)'))
    }
    console.log('Index objects newer than:', startTime);
    for (var i = 0; i < river_configs.configs.length; i++){
        var riverconfig = require(path.join(settings.app_dir, '/config/', river_configs.configs[i].config_file));
        var config = getIndexFiles(settings, elastic, riverconfig, river_configs.configs[i].id, river_configs.configs[i].cluster_name);
        config.syncReq.eeaRDF.startTime = startTime;
        var river_name = "_river/" + river_configs.configs[i].id;
        var river_meta = river_name+"/_meta";
        esQuery
            .PUT(elastic.index, config.analyzers, callback('Setting up new index and analyzers'))
            .DELETE(river_name, callback('Deleting river! (if it exists)'))
            .PUT(river_meta, config.syncReq, callback('Adding river back'))
    }
    esQuery.PUT(elastic.index + '/status/last_update', {'updated_at': Date.now() }, callback('Rivers updated'))
            .execute();

}

function reIndex(settings) {
    settings.remove_all = true;
    createIndex(settings);
}

function showHelp() {
    console.log('List of available commands:');
    console.log(' runserver: Run the app web server');
    console.log('');
    console.log(' sync_index: Get changes from the semantic DB into the ES index');
    console.log(' create_index: Setup Elastic index and trigger indexing');
    console.log('');
    console.log(' remove_data: Remove the ES index of this application');
    console.log(' remove_river: Remove the running river indexer if any');
    console.log('');
    console.log(' reindex: Remove river and data, recrate the index on the elastic_host and start harvesting');
    console.log('');
    console.log(' help: Show this menu');
    console.log('');
}

module.exports = {
    'sync_index': createIndex,
    'remove_river': removeRiver,
    'remove_data': removeData,
    'create_index': createIndex,
    'reindex': reIndex,
    'help': showHelp
}
