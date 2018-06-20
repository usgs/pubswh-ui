import $ from 'jquery';
import Backbone from 'backbone';

import EditCorporationView from '../../../../scripts/manager/views/EditCorporationView';


describe('views/EditCorporationView', function() {
    var testView, $testDiv;
    var testModel;

    beforeEach(function() {
        $('body').append('<div id="test-div"></div>');
        $testDiv = $('#test-div');

        testModel = new Backbone.Model();
        testView = new EditCorporationView({
            el : $testDiv,
            model : testModel
        });
    });

    afterEach(function() {
        testView.remove();
        $testDiv.remove();
    });

    it('Expects that the organization text field contains the contents of the organization property when the view is rendered', function() {
        testModel.set('organization', 'Turtle Research');
        testView.render();

        expect($testDiv.find('#organization').val()).toEqual('Turtle Research');
    });

    it('Expects that the organization text field updates when the model property, organization is updated', function() {
        var $organization;
        testView.render();
        $organization = $testDiv.find('#organization');
        testModel.set('organization', 'Turtle Research');

        expect($organization.val()).toEqual('Turtle Research');

        testModel.unset('organization');
        expect($organization.val()).toEqual('');
    });

    it('Expects that if the #organization input is updated, the model is updated', function() {
        var $organization;
        testView.render();
        $organization = $testDiv.find('#organization');
        $organization.val('Turtle Research').trigger('change');

        expect(testModel.get('organization')).toEqual('Turtle Research');

        $organization.val('').trigger('change');

        expect(testModel.get('organization')).toEqual('');
    });
});
