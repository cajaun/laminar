/** Returns the last index of an item based on a given criteria. */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    chunk: function() {
        return chunk;
    },
    findLastIndex: function() {
        return findLastIndex;
    },
    groupBy: function() {
        return groupBy;
    },
    intersecting: function() {
        return intersecting;
    },
    replaceValue: function() {
        return replaceValue;
    },
    uniqBy: function() {
        return uniqBy;
    }
});
function findLastIndex(array, predicate) {
    for(let i = array.length - 1; i >= 0; i--){
        if (predicate(array[i])) {
            return i;
        }
    }
    return -1;
}
function intersecting(a, b) {
    const [c, d] = a.length > b.length ? [
        a,
        b
    ] : [
        b,
        a
    ];
    return c.filter((value)=>d.includes(value));
}
function replaceValue(values, original, replacement) {
    const index = values.indexOf(original);
    if (index > -1) {
        values[index] = replacement;
    }
    return values;
}
function uniqBy(array, key) {
    const seen = {};
    return array.filter((item)=>{
        const k = key(item);
        if (seen[k]) {
            return false;
        }
        seen[k] = true;
        return true;
    });
}
function chunk(array, size) {
    const chunked = [];
    let index = 0;
    while(index < array.length){
        chunked.push(array.slice(index, index += size));
    }
    return chunked;
}
function groupBy(list, getKey) {
    return list.reduce((previous, currentItem)=>{
        const group = getKey(currentItem);
        if (!previous[group]) {
            previous[group] = [];
        }
        previous[group].push(currentItem);
        return previous;
    }, {});
}

//# sourceMappingURL=array.js.map