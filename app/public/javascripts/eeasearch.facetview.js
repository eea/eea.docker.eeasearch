$(function($) {

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
        'Daviz Visualization' : [],
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

  function getToday() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    var output = [
      d.getFullYear(),
      '-',
      (month < 10 ? '0' : ''),
      month,
      '-',
      (day < 10 ? '0' : ''),
      day].join('');
    return output;
  }

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

  function add_EEA_settings() {
    //Accordion settings
    $('#facetview_trees')
        .addClass('eea-accordion-panels collapsed-by-default non-exclusive');
    $('.facetview_filter').addClass('eea-accordion-panel');
    $('.facetview_showtree').addClass('notoc eea-icon-right-container');
    $('.facetview_arrow_right').addClass('eea-icon eea-icon-right');
    //Remove results button
    $('.facetview_howmany').hide();
    //Remove facetview help
    $('.facetview_learnmore').hide();
    //Remove share button
    $('.facetview_sharesave').hide();
    //replace share icon
    $('.icon-share-alt').addClass('eea-icon eea-icon-share-alt');
    $('.eea-icon-share-alt').removeClass('icon-share-alt');
    $('.share-icon').addClass('eea-icon eea-icon-share-alt');
    //replace remove icon
    $('.icon-remove').addClass('eea-icon eea-icon-times');
    $('.eea-icon-times').removeClass('icon-remove');
    //change pagination
    $('.pagination').addClass('paginator listingBar');
    //Change top pagination
    var results = $($('.pagination').find('.active')[0]).text(); //x-y of z
    var split = results.split(' of ');
    if (split.length === 2) {
      var html = [
        '<span>Results ',
        split[0],
        ' of <strong>',
        split[1],
        '</strong></span>'
        ].join('');
    $('.top-pagination').html(html);
    } else {
      $('.top-pagination').html('');
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

  function display_results() {
    $('.eea-tile').remove();
    var data = $.fn.facetview.options.data;
    var prependto = $('.facetview_metadata');
    var pagers = prependto.length;
    if (prependto.length == 2) {
      prependto = $(prependto[1]);
    }

    // var template
    /*
      <div class="eea-tile">
        <a class="eea-tileInner" 
           title="{{ tile-title }}" 
           href="{{ tile-url }}">
          <div class="eea-tileThumb" style="background-image: url({{ thumb-url }})">
            <img src="{{ thumb-url }}">
          </div>
          <div class="eea-tileBody">  
            <strong class="eea-tileType" style="background-image: url({{ tile-typeIcon }})">
              <span class="eea-tileTypeIcon eea-tileType-{{ tile-typeClass }}" title="{{ tile-type }}"></span> {{ tile-type }}
            </strong>
            <h4 class="eea-tileTitle">{{ tile-title }}</h4>
            <span class="eea-tileTopic" title="{{ tile-topic }}">{{ tile-topic }}</span>
            <time class="eea-tileIssued" datetime="{{ tile-datestamp }}">{{ tile-date }}</time>
          </div>
        </a>
      </div>
    */
    var $results = $('<div class="eea-tiles"/>');
    var template = '<div class="eea-tile"> <a class="eea-tileInner"title="{{ tile-title }}"href="{{ tile-url }}"> <div class="eea-tileThumb" style="background-image: url({{ thumb-url }})"> <img src="{{ thumb-url }}"> </div> <div class="eea-tileBody"> <strong class="eea-tileType" style="background-image: url({{ tile-typeIcon }})"> <span class="eea-tileTypeIcon eea-tileType-{{ tile-typeClass }}" title="{{ tile-type }}"></span> {{ tile-type }} </strong> <h4 class="eea-tileTitle">{{ tile-title }}</h4> <span class="eea-tileTopic" title="{{ tile-topic }}">{{ tile-topic }}</span> <time class="eea-tileIssued" datetime="{{ tile-datestamp }}">{{ tile-date }}</time> </div> </a> </div> ';


    for (var i = 0; i < data.records.length; i++) {
      var element = data.records[i];
      var title = element['http://purl.org/dc/terms/title'];
      var url = element['http://www.w3.org/1999/02/22-rdf-syntax-ns#about'];
      var datestamp = element['http://purl.org/dc/terms/issued'];
      var types = element['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];
      if (!(types instanceof Array)) {
         types = [types];
      }
      var topics = element['http://www.eea.europa.eu/portal_types#topic'];
      if (!(topics instanceof Array)) {
         topics = [topics];
      }
      if (datestamp === undefined) {
        datestamp = element['http://purl.org/dc/terms/modified'];
        if (datestamp === undefined) {
          datestamp = element['http://purl.org/dc/terms/created'];
          if (datestamp === undefined) {
             datestamp = '';
          }
        }
      }
      date = $.datepicker.formatDate('dd M yy', new Date(datestamp));
      
      type = types[types.length - 1];
      typeClass = type.toLowerCase().replace(/\s/g, '-');

      // Map content type to icons
      var contentTypes = {
        'external-data-reference': 'data',
        'output-from-annual-management-plan': 'xxx',
        'indicator-specification': 'xxx',
        'indicator-assessment': 'xxx',
        'highlight': 'xxx',
        'file': 'document',
        'eyewitness-story': 'xxx',
        'page': 'document',
        'press-release': 'xxx',
        'report': 'xxx',
        'speech': 'xxx',
        'figure': 'xxx',
        'folder': 'folder'
      };
      
      templateItems = {
        '{{ tile-title }}': title,
        '{{ tile-url }}': url,
        '{{ thumb-url }}': url + '/image_mini',
        '{{ tile-type }}': type,
        '{{ tile-typeIcon }}': 'http://www.eea.europa.eu/portal_depiction/' + (contentTypes[typeClass] || 'file') + '/image_icon',
        '{{ tile-topic }}': topics.join(', '),
        '{{ tile-datestamp }}': datestamp,
        '{{ tile-date }}': date,
      };

      $result = $(
        template.replace(/\{\{(.*?)\}\}/gi, function(matched){
          return templateItems[matched];
        })
      );
      $result.find('img').load(function() {
        aspectRatio = this.naturalWidth / this.naturalHeight;
        if (aspectRatio >= 16 / 9) {
          $(this).addClass('img-wider');
        } else {
          $(this).addClass('img-narrower');
        }
      });

      $results.append($result);
    }

    prependto.before( $results );
  }

  var url = $(location).attr('href');
  var position = url.indexOf('/search/');
  var language = url[position - 3] === '/' ?
      url.substring(position - 2, position) :
      'en';
  var today = getToday();

  var facetview_ob = $('.facet-view-simple').facetview({
    search_url: './api',
    datatype: 'json',
    search_index: 'elasticsearch',
    facets: [
      {
        'field': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        'display': 'Content type',
        'size': '50000',
        'min_size': '10',
        'order': 'term',
        'operator': 'OR',
        'facet_display_options': ['sort', 'checkbox']
      },
      {
        'field': 'http://www.eea.europa.eu/portal_types#topic',
        'display': 'Topic',
        'size': '100',
        'min_size': '10',
        'order': 'term',
        'operator': 'AND',
        'facet_display_options': ['sort', 'checkbox']
      },
      {
        'field': 'http://purl.org/dc/terms/spatial',
        'display': 'Country',
        'size': '100',
        'min_size': '10',
        'order': 'term',
        'operator': 'AND',
        'facet_display_options': ['sort', 'checkbox']
      }
    ],
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
    result_display: [],
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
    post_search_callback: function() {
      display_results();
      hide_unused_options(blackList, whiteList);
      add_EEA_settings();
      add_iframe();
    },
    post_init_callback: function() {
      add_EEA_settings();
    },
    linkify: false,
           paging: {
              from: 0,
              size: 20
            }
  });

});
