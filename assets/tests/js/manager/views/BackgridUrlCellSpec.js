import $ from 'jquery';
import Backbone from 'backbone';
import Backgrid from 'backgrid';

import BackgridUrlCell from '../../../../scripts/manager/views/BackgridUrlCell';


describe('BackgridUrlCell', function() {
    var testColumn, testModel, testCell, TestUrlCell;
    var routerSpy;

    beforeEach(function() {
        $('body').append('<div id=test-div></div>');

        testColumn = new Backgrid.Column({
            name : 'testProp',
            formatter : {
                fromRaw: function (rawValue, model) {
                    return model.get('title') + ' - ' + rawValue;
                }
            }
        });

        testModel = new Backbone.Model({
            testProp : 1234,
            title : 'Title 1'
        });

        routerSpy = jasmine.createSpyObj('routerSpy', ['navigate']);

        TestUrlCell = BackgridUrlCell.extend({
            title : 'Click cell to edit',
            router : routerSpy,
            toFragment : function(rawValue) {
                return 'edit/' + rawValue;
            }
        });
        testCell = new TestUrlCell({
            column : testColumn,
            model : testModel,
            el : '#test-div'
        });
    });

    afterEach(function() {
        testCell.remove();
        $('#test-div').remove();
    });

    it('Expects that rendering the cell creates a link with the expected attributes', function() {
        var $link;
        testCell.render();

        $link = testCell.$('a');
        expect($link.length).toBe(1);
        expect($link.attr('title')).toEqual('Click cell to edit');
        expect($link.html()).toEqual('Title 1 - 1234');
    });

    it('Expects that if the cell is clicked, the router is used to navigate to the cell\'s fragment', function() {
        testCell.render();
        testCell.$('a').trigger('click', {preventDefault : jasmine.createSpy('preventDefault')});
        expect(routerSpy.navigate).toHaveBeenCalledWith('edit/1234', {trigger : true});
    });
});
