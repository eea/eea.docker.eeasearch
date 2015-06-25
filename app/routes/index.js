/*
 * GET home page.
 */
var searchServer = require('eea-searchserver')

exports.index = function(req, res) {
    searchServer.EEAFacetFramework.render(req, res, 'index', {disableBreadcrumbs: true});
};
