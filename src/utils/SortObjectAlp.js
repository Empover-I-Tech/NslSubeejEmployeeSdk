export function sortObjectsAlphabetically(objects, key) {
    objects.sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];
 
        const valueALower = valueA.toLowerCase();
        const valueBLower = valueB.toLowerCase();
 
        return valueALower.localeCompare(valueBLower);
    });
 
    // Return the sorted array
    return objects;
}
 