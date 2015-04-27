/*
 * GET home page.
 */
var nconf = require('nconf');
var path = require('path');
var fs = require('fs');
var searchServer = require('eea-searchserver');

exports.index = function(req, res) {
    var templatePath = nconf.get('external_templates:local_path');
    res.render('index', {
        'headFile': path.join(templatePath, 'head.html'),
        'headerFile': path.join(templatePath, 'header.html'),
        'footerFile': path.join(templatePath, 'footer.html'),
        'templateRender': fs.readFileSync});
};
