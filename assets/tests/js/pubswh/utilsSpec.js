import {removeObjectsWithDuplicateValues} from '../../../scripts/pubswh/utils';

describe('The removeObjectsWithDuplicateValues function test', function() {

    let sampleArrayWithDuplicates = [{'id':1,'text':' duplicated listing','selected':false},{'id':2,'text':' duplicated listing','selected':false}];
    let sampleArrayWithoutDuplicates = [{'id':1,'text':' unique listing 1','selected':false},{'id':2,'text':' unique listing 2','selected':false}];
    let sampleArrayEmpty = [];

    it('expects if given an array with duplicates, it will return an array without duplicates', function() {
       expect(removeObjectsWithDuplicateValues(sampleArrayWithDuplicates, 'text').length).toEqual(1);
    });

    it('expects if given an array with NO duplicates, it will return the same array', function() {
        expect(removeObjectsWithDuplicateValues(sampleArrayWithoutDuplicates, 'text').length).toEqual(2);
        expect(removeObjectsWithDuplicateValues(sampleArrayWithoutDuplicates, 'text')[0].id).toEqual(1);
        expect(removeObjectsWithDuplicateValues(sampleArrayWithoutDuplicates, 'text')[1].id).toEqual(2);
    });

    it('expects if given an empty array, it will return an empty array', function() {
        expect(removeObjectsWithDuplicateValues(sampleArrayEmpty, 'text').length).toEqual(0);
    });
});
