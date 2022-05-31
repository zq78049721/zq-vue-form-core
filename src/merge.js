import { each } from './uitl'

export default function (values, fields) {
    const store = new Map();
    const keys = Object.keys(values);
    const normalValues = keys.filter(key => {
        return !fields[key].mut;
    }).map(key => {
        return {
            [key]: values[key]
        }
    });

    each(keys, (key) => {
        const { mut } = fields[key];
        const { name, id } = mut;
        const orignFieldName = key.replace(`_$${id}$_`, '')
        const value = values[key];
        if (!store.has(name)) {
            const mutValue={
                [name]:[]
            };
            mutValue[name][id]={};
            mutValue[name][id][orignFieldName]=value;
            store.set(name, mutValue);
        } else {
            const currentValue = store.get(name);
            if (!currentValue[name][id]) {
                currentValue[name][id] = {}
            }
            currentValue[name][id][orignFieldName] = value;
        }
    }, key => {
        return fields[key].mut;
    });

    store.forEach((value,key)=>{
        value[key]=value[key].filter(f=>f!=undefined && f!=null);
    })
    const result = Object.assign({}, ...normalValues, ...store.values());
    return result;
}