import Schema from 'async-validator';
import { each, mapObj } from './uitl'


function createDescriptorItem(currentRule, vm) {
    if (currentRule.validator) {
        return {
            validator: function (rule, value, callback, source, options) {
                const props = {
                    rule,
                    value,
                    callback,
                    source,
                    options,
                    vm
                }
                currentRule.validator(props)
            }
        }
    } else {
        return currentRule;
    }
}


export function validateField(values, field, vm) {
    const { rules, name } = field;
    field.error = null;
    if (!rules || !rules.length) {
        return [, values, [field]]
    }

    const rs = rules.map((rule) => {
        return createDescriptorItem(rule, vm);
    })

    const descriptor = { [name]: rs }
    const validator = new Schema(descriptor);
    return new Promise(reslove => {
        validator.validate(values, (errors, fields) => {
            if (errors) {
                field.error = errors[0].message;
            }
            reslove([errors, values, fields]);
        });
    })
}



export default function (values, type, vm) {
    const descriptor = mapObj(vm.formData.fields, (item, key) => {
        const { rules } = item;
        const value = rules.map(currentRule => createDescriptorItem(currentRule, vm))
        return {
            key,
            value,
        }
    }, true, (item, key) => {
        vm.formData.fields[key].error = null;
        return item.rules && item.rules.length && item.visable(vm);
    })

    const validator = new Schema(descriptor);
    return new Promise(reslove => {
        validator.validate(values, (errors, fields) => {
            if (errors) {
                each(errors, (error) => {
                    const { message } = error;
                    vm.formData.fields[error.field].error = message;
                })
            }
            reslove([errors, values, fields]);
        });
    })
}