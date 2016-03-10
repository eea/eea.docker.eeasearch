/*
 * GET home page.
 */

var nconf = require('nconf');
var searchServer = require('eea-searchserver')
var _ = require('underscore');
var layout_vars = nconf.get("layout_vars");

if (typeof layout_vars === 'undefined') {
  layout_vars = {}
}

exports.index = function(req, res) {
    var options = { }
    
    options = _.extend(options, layout_vars);

    searchServer.EEAFacetFramework.render(req, res, 'index', options);
};
