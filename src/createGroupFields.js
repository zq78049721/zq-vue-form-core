import { mapObj, each } from './uitl';
import createMutStore from './mutStore'

export default function ({ getFields, getInitialValues, onSubmit, onChange, muts }) {
    const mutsStore =muts;
    const groupStore = new Map();
    const _getMutFields = mutsStore.getMutFields;
    mutsStore.getMutFields = function (fieldName, values,vm) {
        const mutFileds = _getMutFields(fieldName, values,vm);
        each(mutFileds, (field) => {
            field.group = groupStore.get(fieldName)
        })
        return mutFileds;
    }

    async function _getFields(props, vm) {
        const result = await getFields(props, vm);
        const groupFields = mapObj(result, (groupItem, groupName) => {
            const group = {
                ...groupItem,
                name: groupName
            }
            const fieldItems = mapObj(group.items, (item, itemName) => {
                groupStore.set(itemName, group);
                return {
                    ...item,
                    name:  itemName,
                    originName: itemName,
                    group
                }
            })
            return fieldItems;
        })

        const fields = [].concat.apply([], groupFields);
        return mapObj(fields, (field) => {
            return {
                key: field.name,
                value: field
            }
        }, true)
    }


    async function _onSubmit(values, vm) {
        const result = {};
        each(values, (value, prop) => {
            const group=groupStore.get(prop);
            const { name } = group;
            if (!result[name]) {
                result[name] = {};
            }
            result[name][prop] = value;
        })
        return onSubmit(result, vm)
    }

    return {
        getInitialValues,
        onChange,
        getFields: _getFields,
        onSubmit: _onSubmit,
        muts:mutsStore,
    }
}