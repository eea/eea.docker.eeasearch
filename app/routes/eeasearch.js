/*
 * GET home page.
 */

var searchServer = require('eea-searchserver')
var nconf = require('nconf');
var _ = require('underscore');
var field_base = nconf.get("elastic:field_base");
var layout_vars = nconf.get("layout_vars");

function getLastUpdateDate(){
    var elastic = nconf.get()['elastic'];
    var dateFormat = require('dateformat');
    var request = require('sync-request');
    var creation_date = 'unknown';

    var indexed_url = 'http://' + elastic.host + ':' + elastic.port + elastic.path + elastic.index + '/status/last_update';
    try {
        res = request('GET', indexed_url);
        var res_json = JSON.parse(res.getBody('utf8'));
        var dates = [];
        Object.keys(res_json._source.updated_at).forEach(function(key){
            dates.push(res_json._source.updated_at[key]);
        });
        var latest = Math.max.apply(null, dates);
        creation_date = new Date(latest);
        creation_date = dateFormat(creation_date, 'dd mmmm yyyy HH:MM TT');
    }
    catch (e) {
        console.log('Index is missing', e.message);
    }
    return creation_date;
}

if (typeof layout_vars === 'undefined') {
  layout_vars = {}
}

exports.index = function(req, res){
  var options = {title: 'search'};

  options = _.extend(options, layout_vars);
  options.getIndexCreationDate = getLastUpdateDate;
  searchServer.EEAFacetFramework.render(req, res, 'index', options);
};

exports.details = searchServer.builtinRoutes.details;
