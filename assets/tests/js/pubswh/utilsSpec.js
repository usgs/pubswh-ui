import {removeObjectsWithDuplicateValues} from '../../../scripts/pubswh/utils';

describe('Utils', function() {

    var sampleArrayWithDuplicates = [{'id':1,'text':' duplicated listing','selected':false},{'id':2,'text':' duplicated listing','selected':false}];

    it('expects if given an array with duplicates, it will return an array without duplicates', function () {
       expect(sampleArrayWithDuplicates.length).toEqual(2);
       expect(removeObjectsWithDuplicateValues(sampleArrayWithDuplicates, 'text').length).toEqual(1);
    });
});
