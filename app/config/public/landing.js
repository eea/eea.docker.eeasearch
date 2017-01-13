$.fn.landingTile = function(settings) {
    this.data("options", settings);


    var options = $(this).data("options");
    if (options.type === "simple"){
        $(this).css("cursor","pointer");
    }

    var getValueFromFacet = function(facet, value){
        var retVal = 0;
        var tree = $("[id='" + facet + "']").closest(".facetview_filter").find(".facetview_tree");
        var visibleValues = tree.find("li").filter(function(idx, el) { return el.style.display !== "none"})
        if (value === "count"){
            retVal = visibleValues.length;
        }
        if (value === "min"){
            var values = jQuery.map(visibleValues, function(element) { if (jQuery(element).find(".facet_label_text").text() !== 'undefined') return jQuery(element).find(".facet_label_text").text(); });
            values.sort();
            retVal = values[0];
        }
        if (value === "max"){
            var values = jQuery.map(visibleValues, function(element) { if (jQuery(element).find(".facet_label_text").text() !== 'undefined') return jQuery(element).find(".facet_label_text").text(); });
            values.sort();
            retVal = values[values.length - 1];
        }
        return retVal;
    }

    var getValueFromResults = function(value){
        var retVal = 0;
        if (value === "count"){
            retVal = $(".eea_results_count").text();
        }
        return retVal;
    }

    this.bind("facet_ready", function (){
        var options = $(this).data("options");
        if (options.values !== undefined){
            for (var i = 0; i < options.values.length; i++){
                valueSettingsForTile = {"type": "facet", "facet": options.facet}
                jQuery.extend(valueSettingsForTile, options.values[i]);
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
        if (options.values !== undefined){
            for (var i = 0; i < options.values.length; i++){
                valueSettingsForTile = {"type": "facet", "facet": options.facet}
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
        if (options.values !== undefined){
            for (var i = 0; i < options.values.length; i++){
                valueSettingsForTile = {"type": "facet", "facet": options.facet}
                jQuery.extend(valueSettingsForTile, options.values[i]);
                if (valueSettingsForTile.type === "results"){
                    if (valueSettingsForTile.method !== undefined){
                        valueSettingsForTile.method(valueSettingsForTile.value, valueSettingsForTile.name);
                    }
                    else {

                    }
                }
            }
        }
    });

    this.bind("click", function () {
        var options = $(this).data("options");
        if (options.type === "simple"){
            if (!$("[id='" + options.facet + "']").hasClass("facetview_open")){
                $("[id='" + options.facet + "']").click();
            }
        }
    });
}

function getAllResults(value, name){
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
    $(".landing_tile .eea_tile.organisations").landingTile(
        {
            type : "simple",
            facet : "organisation",
            values : [{"value":"count", "name":"organisations_count"}]
        }
    );
    $(".landing_tile .eea_tile.topics").landingTile(
        {
            type : "simple",
            facet : "http://www.eea.europa.eu/portal_types#topic",
            values : [{"value":"count", "name":"topics_count"}]
        }
    );
    $(".landing_tile .eea_tile.content_types").landingTile(
        {
            type : "simple",
            facet : "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            values : [{"value":"count", "name":"content_types_count"}]
        }
    );
    $(".landing_tile .eea_tile.countries").landingTile(
        {
            type : "simple",
            facet : "http://purl.org/dc/terms/spatial",
            values : [{"value":"count", "name":"countries_count"}]
        }
    );
    $(".landing_tile .eea_tile.time_coverage").landingTile(
        {
            type : "simple",
            facet : "year",
            values : [{"value":"min", "name":"time_coverage_min"}, {"type":"fixed", "value":"2016", "name":"time_coverage_max"}]
        }
    );
    $(".landing_tile .eea_tile.available_content").landingTile(
        {
            type : "custom",
            values : [{"value":"count", "facet":"language", "name":"language_count"}, {"type":"results", "value":"count", "name":"documents_count", "method":getAllResults}]
        }
    );

/*    var itemTemplate='<a href="{url}">{title}</a><strong>{type}</strong><span>Published on</span><span>{publish_date}</span>'
    $(".landing_tile .eea_tile.latest_objects").landingTile(
        {
            type : "custom",
            values : [{"type":"results", "value":"rows", "name":"language_count", "template": itemTemplate, "mapping":{"url":''}}]
        }
    );*/
});
