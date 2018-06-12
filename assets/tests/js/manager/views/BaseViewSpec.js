/*jslint browser:true*/
/*global expect*/
/*global jasmine*/
/*global describe*/
/*global beforeEach*/
/*global afterEach*/
/*global it*/


define([
	'views/BaseView'
],
function(BaseView) {
	describe('BaseView', function() {
		var testView;
		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			this.$testDiv = $('#test-div');

			this.templateSpy = jasmine.createSpy('templateSpy').and.returnValue('Template content');

			this.TestView = BaseView.extend({
				template : this.templateSpy
			});
		});

		afterEach(function() {
			testView.remove();
			this.$testDiv.remove();
		});

		it('Expects the template property to be used to render this view if not overridden in options', function() {
			testView = new this.TestView({
				el : this.$testDiv
			});

 			expect(testView.template()).toEqual('Template content');
		});

		it('Expects the template passed in via instantiation to override the template property when rendering', function() {
			var testTemplate = jasmine.createSpy('secondTemplateSpy').and.returnValue('New template content');
			testView = new this.TestView({
				el : this.$testDiv,
				template : testTemplate
			});

			expect(testView.template()).toEqual('New template content')
		});

		it('Expects a call to render to call the template function and render the content', function() {
			testView = new this.TestView({
				el : this.$testDiv
			}).render();
			testView.render();
			expect(this.templateSpy).toHaveBeenCalled();
			expect(this.$testDiv.html()).toEqual('Template content');
		});

		it('Expects that if the view is instantiated with a context, that context is called by the template function', function() {
			testView = new this.TestView({
				el : this.$testDiv,
				template : this.templateSpy,
				context : {
					prop1 : 'One',
					prop2 : 'Two'
				}
			}).render();

			expect(this.templateSpy).toHaveBeenCalledWith({
					prop1 : 'One',
					prop2 : 'Two'
			});
		});
	});

});
