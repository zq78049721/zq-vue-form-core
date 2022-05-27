import Schema from 'async-validator';
import { each, mapObj } from './uitl'

export default function (values, type, vm) {
    const descriptor = mapObj(vm.formData.fields, (item, key) => {
        const { rules } = item;
        const value = rules.map(currentRule => {
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
        })
        return {
            key,
            value,
        }
    }, true, (item,key) => {
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