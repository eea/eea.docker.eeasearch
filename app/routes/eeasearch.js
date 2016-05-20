/*
 * GET home page.
 */

var searchServer = require('eea-searchserver')
var nconf = require('nconf');
var _ = require('underscore');
var field_base = nconf.get("elastic:field_base");
var layout_vars = nconf.get("layout_vars");

function getIndexCreationDate() {
    var request = require('sync-request');
    var dateFormat = require('dateformat');
    var elastic = nconf.get()['elastic'];
    var indexed_url = 'http://' + elastic.host + ':' + elastic.port + elastic.path + '_river/eeaSearch/last_update';
    console.log(indexed_url);
    var creation_date = 'unknown';
    var res;
    try {
        res = request('GET', indexed_url);
        var res_json = JSON.parse(res.getBody('utf8'));
        var creation_date_stamp = res_json._source.updated_at;
        var creation_date = new Date(creation_date_stamp);
        creation_date = dateFormat(creation_date, 'dd mmmm yyyy HH:MM TT');
        console.log('getIndexCreationDate for river', '-', creation_date);
    } catch(e) {
        console.log(e);
    }
    return creation_date;
}

if (typeof layout_vars === 'undefined') {
  layout_vars = {}
}

exports.index = function(req, res){
  var options = {title: 'search'};

  options = _.extend(options, layout_vars);
  options.getIndexCreationDate = getIndexCreationDate;
  searchServer.EEAFacetFramework.render(req, res, 'index', options);
};

exports.details = searchServer.builtinRoutes.details