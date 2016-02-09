var allTestFiles = [];

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
	if (/Spec\.js$/.test(file)) {
    	allTestFiles.push(file);
  	}
});

require.config({
	// Karma serves files under /base, which is the basePath from your config file
	baseUrl: '/base/pubs_ui/manager/static/js',

	config: {
		'views/ContributorRowView': {
			lookupUrl: "test_lookup/"
		},
		'views/SPNView': {
			lookupUrl: "test_lookup/"
		},
		'utils/DynamicSelect2': {
			lookupUrl: "test_lookup/"
		}
	},

	paths: {
		'sinon': '/base/pubs_ui/bower_components/sinon/lib/sinon',
		'squire': '/base/pubs_ui/bower_components/Squire.js/src/Squire',
		'jquery': '/base/pubs_ui/bower_components/jquery/dist/jquery',
		'jquery-ui': '/base/pubs_ui/bower_components/jquery-ui/jquery-ui',
		'select2': '/base/pubs_ui/bower_components/select2/dist/js/select2.full',
		'tinymce': '/base/pubs_ui/bower_components/tinymce/tinymce',
		'bootstrap': '/base/pubs_ui/bower_components/bootstrap/dist/js/bootstrap',
		'text': '/base/pubs_ui/bower_components/text/text',
		'underscore': '/base/pubs_ui/bower_components/underscore/underscore',
		'backbone': '/base/pubs_ui/bower_components/backbone/backbone',
		'backbone.paginator': '/base/pubs_ui/bower_components/backbone.paginator/lib/backbone.paginator',
		'backgrid': '/base/pubs_ui/bower_components/backgrid/lib/backgrid',
		'backgrid-select-all': '/base/pubs_ui/bower_components/backgrid-select-all/backgrid-select-all',
		'backgrid-paginator': '/base/pubs_ui/bower_components/backgrid-paginator/backgrid-paginator',
		'handlebars': '/base/pubs_ui/bower_components/handlebars/handlebars.amd',
		'hbs': '/base/pubs_ui/bower_components/requirejs-hbs/hbs',
		'backbone.stickit': '/base/pubs_ui/bower_components/backbone.stickit/backbone.stickit',
		'moment': '/base/pubs_ui/bower_components/moment/min/moment.min',
		'datetimepicker': '/base/pubs_ui/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min'
	},
	shim: {
		'jquery': {
			exports: '$'
		},
		'select2': ['jquery'],
		'jquery-ui': {
			dep: ['jquery'],
			init: function () {
				$.widget.bridge('uibutton', $.ui.button);
				$.widget.bridge('uitooltip', $.ui.tooltip);
			}
		},
		'bootstrap': ['jquery', 'jquery-ui'],
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		'backbone.paginator': {
			deps: ['underscore', 'backbone']
		},
		'backgrid': {
			deps: ['jquery', 'underscore', 'backbone'],
			exports: 'Backgrid'
		},
		'backgrid-select-all': {
			deps: ['backgrid', 'backbone']
		},
		'backgrid-paginator': {
			deps: ['backbone.paginator', 'backgrid'],
		},
		'backbone.stickit': ['backbone', 'underscore'],
		'datetimepicker': ['jquery', 'moment', 'bootstrap'],
		'handlebars': {
			exports: 'Handlebars'
		},
		'tinymce': {
			exports: 'tinymce',
			init: function () {
				this.tinymce.DOM.events.domLoaded = true;
				return this.tinymce;
			}
		},
		'sinon': {
			'exports': 'sinon'
		},
		packages: [
			{
				name: 'hbs',
				location: '../../../bower_components/requirejs-hbs/hbs',
				main: 'hbs'
			}
		]
	}
});
require(allTestFiles, window.__karma__.start);



