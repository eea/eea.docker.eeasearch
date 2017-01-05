$.fn.landingTile = function(settings) {
    this.data("options", settings);


    var options = $(this).data("options");
    if (options.type === "simple"){
        $(this).css("cursor","pointer");
    }

    var getValueFromFacet = function(facet, value){
        var retVal = [];
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

    this.bind("click", function () {
        var options = $(this).data("options");
        if (options.type === "simple"){
            if (!$("[id='" + options.facet + "']").hasClass("facetview_open")){
                $("[id='" + options.facet + "']").click();
            }
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
            values : [{"value":"count", "facet":"language", "name":"language_count"}]
        }
    );
});
