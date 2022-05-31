export function isEmpty(value) {
    return value === null || value === undefined
}

export function isBool(value) {
    return typeof value === "boolean";
}


export function isFunction(value) {
    return typeof value === "function";
}

export function each(obj, fun, filter) {
    for (let index in obj) {
        const item = obj[index];
        if (filter && !filter(item, index)) {
            continue;
        }
        fun(item, index);
    }
}

export function keyValueListToJson(list, fun) {
    const obj = {};
    each(list, (item) => {
        if (fun) {
            const { key, value } = fun(item);
            obj[key] = value;
        } else {
            const { key, value } = item;
            obj[key] = value;
        }
    })
    return obj;
}

export function mapObj(obj, fun, convertToJson, filter) {
    const result = convertToJson ? {} : [];
    each(obj, function (item, key) {
        const resultItem = fun(item, key);
        if (convertToJson) {
            const { key, value } = resultItem;
            result[key] = value;
        }
        else {
            result.push(resultItem)
        }

    }, filter)
    return result;
}