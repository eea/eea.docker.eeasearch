var blackList = {
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' : []};

var whiteList = false;
var appHierarchy = {
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' :
    [{
      'Highlight' : [],
      'Press Release' : [],
      'Event' : [],
      'Promotion' : [],
      'Article' : [],
      'Eco-Tip' : [],
      'Image' : [],
      'Video' : [],
      'Report' : [],
      'Data' : [],
      'Data Visualization' : [],
      'Indicator Specification' : [],
      'Indicator factsheet' : [],
      'Indicator assessment' : [],
      'Infographic' : [],
      'Briefing' : [],
      'Page': [],
      'Link' : [],
      'Data File' : [],
      'Assessment part' : [],
      'EEA Job Vacancy' : [],
      'Epub File' : [],
      'External Data Reference' : [],
      'Eyewitness story' : [],
      'Figure' : [],
      'File' : [],
      'Folder' : [],
      'GIS Map Application' : [],
      'Methodology Reference' : [],
      'Organization' : [],
      'Policy Question' : [],
      'Rationale Reference' : [],
      'SOER Key fact' : [],
      'SOER Message' : [],
      'SPARQL' : [],
      'Speech' : [],
      'Text' : [],
      'Work Item' : []
      }],
        'http://www.eea.europa.eu/portal_types#topic' : [],
        'http://purl.org/dc/terms/spatial' : []
      };

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

jQuery(document).ready(function($) {
  var url = $(location).attr('href');
  var position = url.indexOf('/search/');
  var language = url[position - 3] === '/' ?
      url.substring(position - 2, position) :
      'en';
  var today = getToday();
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
