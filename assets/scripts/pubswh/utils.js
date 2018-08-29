/**
 * Takes an array of objects, checks for duplicate values of a given property, then
 * creates a new array that excludes the objects containing the duplicated values
 * @param {Array}  arrayWithDuplicates - an array of objects that have properties with possible duplicate values
 * @param {String} propertyName - name of property to check for duplicate values
 * @returns {Array} deduplicatedArray - an array of objects that have NO properties with duplicate values
 */
export function removeObjectsWithDuplicateValues(arrayWithDuplicates, propertyName) {
    let deduplicatedArray = [];
    let indexOfObject;

    arrayWithDuplicates.forEach(function(objectFromArrayWithDuplicates) {
        // if the value for the current index is not in the new list that has no duplicates, function will return -1
        indexOfObject = deduplicatedArray.findIndex(object => object[propertyName] === objectFromArrayWithDuplicates[propertyName]);

        // if the value is not in the new list that has no duplicates add the object containing that value to the list,
        // otherwise do nothing
        if (indexOfObject === -1) {
            deduplicatedArray.push(objectFromArrayWithDuplicates);
        }
    });

    return deduplicatedArray;
}
