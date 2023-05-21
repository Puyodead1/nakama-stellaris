export function merge(obj1: object, obj2: object) {
    for (var attrname in obj1) {
        obj2[attrname] = obj1[attrname];
    }

    return obj2;
}
