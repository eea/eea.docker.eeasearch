/* globals jQuery, $ */
$.fn.landingTile = function(settings) {
    this.data("options", settings);


    var options = $(this).data("options");
    if (options.type === "simple"){
        $(this).css("cursor","pointer");
    }

    var getValueFromFacet = function(facet, value){
        var retVal = 0;
        var tree = $("[id='" + facet + "']").closest(".facetview_filter").find(".facetview_tree");
        var visibleValues = tree.find("li").filter(function(idx, el) { return el.style.display !== "none";});
        var values;
        if (value === "count"){
            retVal = visibleValues.length;
        }
        if (value === "min"){
            values = jQuery.map(visibleValues, function(element) {
                if (jQuery(element).find(".facet_label_text").text() !== 'undefined') {
                    return jQuery(element).find(".facet_label_text").text();
                }
            });
            values.sort();
            retVal = values[0];
        }
        if (value === "max"){
            values = jQuery.map(visibleValues, function(element) {
                if (jQuery(element).find(".facet_label_text").text() !== 'undefined') {
                    return jQuery(element).find(".facet_label_text").text();}
            });
            values.sort();
            retVal = values[values.length - 1];
        }
        return retVal;
    };

    this.bind("facet_ready", function (){
        var options = $(this).data("options");
        var valueSettingsForTile;
        if (options.values !== undefined){
            for (var i = 0; i < options.values.length; i++){
                valueSettingsForTile = {"type": "facet", "facet": options.facet};
                jQuery.extend(valueSettingsForTile, options.values[i]);
                if (valueSettingsForTile.type !== "facet"){
                    return;
                }
                var value = 0;
                if (valueSettingsForTile.type === "facet"){
                    value = getValueFromFacet(valueSettingsForTile.facet, valueSettingsForTile.value);
                }
                if (valueSettingsForTile.type === "fixed"){
                    value = valueSettingsForTile.value;
                }
                $(this).find("."+ valueSettingsForTile.name).text(value);
            }
        }
    });

    this.bind("custom_ready", function(event, value) {
        var options = $(this).data("options");
        var valueSettingsForTile;
        if (options.values !== undefined){
            for (var i = 0; i < options.values.length; i++){
                valueSettingsForTile = {"type": "facet", "facet": options.facet};
                jQuery.extend(valueSettingsForTile, options.values[i]);
                if (valueSettingsForTile.type === "results"){
                    if (valueSettingsForTile.method !== undefined){
                        $(this).find("."+ valueSettingsForTile.name).text(value);
                    }
                }
            }
        }
    });

    this.bind("results_ready", function (){
        var options = $(this).data("options");
        var valueSettingsForTile;
        if (options.values !== undefined){
            for (var i = 0; i < options.values.length; i++){
                valueSettingsForTile = {"type": "facet", "facet": options.facet};
                jQuery.extend(valueSettingsForTile, options.values[i]);
                if (valueSettingsForTile.type === "results"){
                    if (valueSettingsForTile.method !== undefined){
                        valueSettingsForTile.method(valueSettingsForTile.value, valueSettingsForTile.name);
                    }
                    else {
                        if (valueSettingsForTile.value === "rows"){
                            if($.fn.facetview.options.rawdata){
                            $("[class='"+valueSettingsForTile.name+"']").empty();
                                var results = $.fn.facetview.options.rawdata.hits.hits;
                                for (var res_count = 0; res_count < 3; res_count++){
                                    var result = {};
                                    $.extend(result, results[res_count]._source);
                                    var result_for_template = {};
                                    $.each(result, function(key,value){
                                        result_for_template["${"+key+"}"] = value;
                                    });
                                var snippet = replace_variables_in_text(valueSettingsForTile.template, result_for_template);
                                $("[class='"+valueSettingsForTile.name+"']").append($(snippet));
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    this.bind("click", function () {
        var options = $(this).data("options");
        var $simple_facet;
        if (options.type === "simple"){
            $simple_facet = $("[id='" + options.facet + "']");
            if (!$simple_facet.hasClass("facetview_open")){
                $simple_facet.click();
            }
        }
    });
};

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
            facet : "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
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
            values : [{"value":"min", "name":"time_coverage_min"}, {"type":"fixed", "value":"2016", "name":"time_coverage_max"}]
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

    var itemTemplate='<li><a href="${http://www.w3.org/1999/02/22-rdf-syntax-ns#about}">${http://purl.org/dc/terms/title}</a><span>Published on </span><span>${http://purl.org/dc/terms/issued}</span></li>'

    $(".landing_tile .eea_tile.latest_objects").landingTile(
        {
            type : "custom",
            values : [{"type":"results", "value":"rows", "name":"latest_objects_list", "template": itemTemplate}]
        }
    );
});
