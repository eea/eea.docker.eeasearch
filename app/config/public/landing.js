/* globals jQuery, $ */
function getAllResults(){
    var search_url = $.fn.facetview.options.search_url;
    $.ajax({
        type: 'get',
        url: search_url,
        dataType: 'json',
        success: function(sdata) {
            $(".landing_tile .eea_tile").trigger("custom_ready", [sdata.hits.total]);
        }
    });
}

jQuery(document).ready(function($) {
    $(".organisations").landingTile(
        {
            type : "simple",
            facet : "organisation",
            values : [{"value":"count", "name":"organisations_count"}]
        }
    );
    $(".topics").landingTile(
        {
            type : "simple",
            facet : "http://www.eea.europa.eu/portal_types#topic",
            values : [{"value":"count", "name":"topics_count"}]
        }
    );
    $(".content_types").landingTile(
        {
            type : "simple",
            facet : "http://www.eea.europa.eu/ontologies.rdf#objectProvides",
            values : [{"value":"count", "name":"content_types_count"}]
        }
    );
    $(".countries").landingTile(
        {
            type : "simple",
            facet : "http://purl.org/dc/terms/spatial",
            values : [{"value":"count", "name":"countries_count"}]
        }
    );
    $(".time_coverage").landingTile(
        {
            type : "simple",
            facet : "year",
            values : [{"value":"min", "name":"time_coverage_min"}, {"value":"max", "name":"time_coverage_max"}]
        }
    );
    $(".available_content").landingTile(
        {
            type : "custom",
            values : [{"value":"count", "facet":"language", "name":"language_count"}, {"type":"results", "value":"count", "name":"documents_count", "method":getAllResults}]
        }
    );

    $(".mobile_tiles").click(function (ev) {
        $.fn.facetview.dosearch({remove_landing: true});
    });

    $(".show_all_results").click(function (ev) {
        $.fn.facetview.dosearch({remove_landing: true});
    });

    var itemTemplate='<li><a href="${http://www.w3.org/1999/02/22-rdf-syntax-ns#about}">${http://purl.org/dc/terms/title}</a><span>Published on </span><span>${http://purl.org/dc/terms/issued}</span></li>'

    $(".landing_tile .eea_tile.latest_objects").landingTile(
        {
            type : "custom",
            values : [{"type":"results", "value":"rows", "name":"latest_objects_list", "template": itemTemplate}]
        }
    );
});
