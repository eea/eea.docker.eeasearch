var blackList = {
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' : []};

var whiteList = false;

function hide_unused_options(blackList, whiteList) {
  var filters = $('a.facetview_filterchoice');
  for (var filter in filters) {
    var thisFilter = filters[filter];
    var value;
    if (thisFilter.href) {
      value = thisFilter.href.substring(
        thisFilter.href.lastIndexOf('/') + 1,
        thisFilter.href.length);
    }
    if (!whiteList.isEmptyObject) {
      var toKeep = whiteList[thisFilter.rel];
      if (toKeep && toKeep.indexOf(value) === -1) {
        hidden = $(thisFilter.parentNode).remove();
      }

    } else {
      var toHide = blackList[thisFilter.rel];
      if (toHide === undefined) {
        continue;
      }
      if (toHide.indexOf(value) >= 0) {
        $(thisFilter.parentNode).remove();
      }
    }
  }
}

function add_iframe() {
  if (window.embed) {
    var url = $(location).attr('href');
    var position = url.indexOf('?');
    url = url.substring(0, position);
    var width = $('.facet-embed')[0].offsetWidth;
    var height = $('.content').height();

    var button = '<button class="btn btn-small btn-lg" data-toggle="modal"' +
        'data-target="#myModal">' + 'Embed' + ' </button>';
    var popup = [
      '<div class="modal fade" id="myModal" tabindex="-1"',
      'role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">',
      '<div class="modal-dialog">',
      '<div class="modal-content">',
      '<div class="modal-header">',
      '<button type="button" class="close"',
      'data-dismiss="modal" aria-hidden="true">&times;</button> ',
      '<h4 class="modal-title" id="myModalLabel">Embed code</h4>',
      '<div class="modal-body"> <textarea style="width:95%" rows="3">',
      '<iframe width="',
      width,
      '" height="',
      height,
      '" src="',
      url,
      '"></iframe></textarea></div></div></div></div></div>'
    ].join('');

    $('.facet-embed').append(button + popup);

  }
}

function build_hierarchy(facets) {
    var hierarchy = {};
    for (var i = 0; i < facets.length; i++){
        var key = facets[i].field
        var new_item = [];
        for (var j = 0; j < eea_mapping.facets.length; j++){
            if (eea_mapping.facets[j].name === key){
                if (eea_mapping.facets[j].values_whitelist !== undefined){
                    var values = {}
                    for (var k = 0; k < eea_mapping.facets[j].values_whitelist.length; k++){
                        values[eea_mapping.facets[j].values_whitelist[k]] = []
                    }
                    new_item.push(values);
                }
            }
        }
        hierarchy[key] = new_item;
    }
    return hierarchy;
}

function find_language(key, obj){
    if (key === 'language'){
        return {found:true, language:obj}
    }
    if ($.isArray(obj)){
        for (var i = 0; i< obj.length; i++){
            var found = find_language(key, obj[i]);
            if (found.found){
                return found;
            }
        }
    }
    else{
        if (typeof obj === 'object'){
            var keys = [];
            jQuery.each(obj, function(obj_key, obj_value){
                keys.push(obj_key)
            });
            for (var i = 0; i < keys.length; i++){
                var found = find_language(keys[i], obj[keys[i]]);
                console.log(found)
                if (found.found){
                    return found;
                }
            }
        }
    }
    return {found:false};
}
jQuery(document).ready(function($) {
  var url = $(location).attr('href');
  var language = 'en';
  if (url.split("?source=").length === 2){
    var source_str = decodeURIComponent(url.split("?source=")[1]);
    var source_query = JSON.parse(source_str);
    var lang_obj = find_language("root", source_query);
    if (lang_obj.found){
        language = lang_obj.language;
    }
  }

  var today = getToday();

  var appHierarchy = build_hierarchy(buildFacets(eea_mapping.facets).facets);
  eea_facetview('.facet-view-simple', 
  {
    search_url: './api',
    datatype: 'json',
    search_index: 'elasticsearch',
    search_sortby: [
      {
        'field': 'http://purl.org/dc/terms/title',
        'display_asc': 'Title a-z',
        'display_desc': 'Title z-a'
      },
      {
        'field': 'http://purl.org/dc/terms/issued',
        'display_asc': 'Oldest',
        'display_desc': 'Newest'
      }
    ],
    sort: [{'http://purl.org/dc/terms/issued': {'order': 'desc'}}
    ],
    default_operator: 'AND',
    default_freetext_fuzzify: '',
    querystr_filtered_chars: ':?',
    no_results_message: 'Your search did not return any results',
    add_undefined: true,
    predefined_filters: [
      {'term': {'language': language}},
      {'term': {'http://www.eea.europa.eu/ontologies.rdf#hasWorkflowState':
                  'published'}},
      //{'range': {'http://purl.org/dc/terms/issued': {'lte': today}}},
      {'constant_score': {
        'filter': {
          'or': [
            {'missing': {'field': 'http://purl.org/dc/terms/issued'}},
            {'range': {'http://purl.org/dc/terms/issued': {'lte': today}}}
          ]
        }}
      },
      // {'range': {'http://purl.org/dc/terms/expires': {'gte': today}}},
      {'constant_score': {
        'filter': {
          'or': [
            {'missing': {'field': 'http://purl.org/dc/terms/expires'}},
            {'range': {'http://purl.org/dc/terms/expires': {'gte': today}}}
          ]
        }}
      }
    ],
    hierarchy: appHierarchy,
    pager_on_top: true,
    permanent_filters: true,
    post_init_callback: function() {
      add_EEA_settings();
      replaceNumbers();
    },
    post_search_callback: function() {
      hide_unused_options(blackList, whiteList);
      add_EEA_settings();
      viewReady();
      replaceNumbers();
      add_iframe();
    },
    linkify: false,
    paging: {
      from: 0,
      size: 20
    },
    display_type: 'card'
  });

});
