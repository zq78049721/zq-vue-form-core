import { mapObj, each } from './uitl';

export default function ({ getFields, getInitialValues, onSubmit, onChange, singleFieldName = true }) {
    async function _getFields(props, vm) {
        const result = await getFields(props, vm);
        const groupFields = mapObj(result, (group, groupName) => {
            const fieldItems = mapObj(group.items, (item, itemName) => {
                return {
                    ...item,
                    name: singleFieldName ? itemName : `${groupName}$$_$$${itemName}`,
                    originName:itemName,
                    group: {
                        ...group,
                        name: groupName
                    },
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
            const {group,originName}=vm.formData.fields[prop];
            const { name } = group;
            if (!result[name]) {
                result[name] = {};
            }
            result[name][originName] = value;
        })
        return onSubmit(result, vm)
    }

    return {
        getInitialValues,
        onChange,
        getFields: _getFields,
        onSubmit: _onSubmit
    }
}