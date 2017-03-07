/* globals jQuery, $ */
function getAllResults(name){
    var search_url = $.fn.facetview.options.search_url;
    $.ajax({
        type: 'get',
        url: search_url,
        dataType: 'json',
        success: function(sdata) {
            $("#landing").trigger("custom_ready", {name:name, value:[sdata.hits.total]});
        }
    });
}

jQuery(document).ready(function($) {
    var itemTemplate='<li><a href="${http://www.w3.org/1999/02/22-rdf-syntax-ns#about}">${label}</a><span>Published on </span><span>${http://purl.org/dc/terms/issued}</span></li>'
    var options = {
        tiles: [
            {
                tile: ".organisations",
                type: "simple",
                facet: "organisation",
                values: [{"value":"full_count", "name":"organisations_count"}]
            },
            {
                tile: ".topics",
                type: "simple",
                facet: "http://www.eea.europa.eu/portal_types#topic",
                values: [{"value":"count", "name":"topics_count"}]
            },
            {
                tile: ".content_types",
                type: "simple",
                facet: "http://www.eea.europa.eu/ontologies.rdf#objectProvides",
                values: [{"value":"count", "name":"content_types_count"}]
            },
            {
                tile: ".countries",
                type: "simple",
                facet: "http://purl.org/dc/terms/spatial",
                values: [{"value":"count", "name":"countries_count"}]
            },
            {
                tile: ".time_coverage",
                type: "simple",
                facet: "year",
                values: [{"value":"min", "name":"time_coverage_min"}, {"value":"max", "name":"time_coverage_max"}]
            },
            {
                tile: ".available_content",
                type: "custom",
                values: [{"value":"count", "facet":"language", "name":"language_count"}, {"type":"results", "value":"count", "name":"documents_count", "method":getAllResults}]
            },
            {
                tile: ".landing_tile .eea_tile.latest_objects",
                type: "custom",
                values: [{"type":"results", "value":"rows", "name":"latest_objects_list", "template": itemTemplate}]
            }
        ]
    };


    $("#landing").landingView(options);


    $(".mobile_tiles").click(function (ev) {
        ev.preventDefault();
        $.fn.facetview.dosearch({remove_landing: true});
    });

    $(".show_all_results").click(function (ev) {
        ev.preventDefault();
        $.fn.facetview.dosearch({remove_landing: true});
    });
});
