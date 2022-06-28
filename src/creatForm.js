
import createVisable from './createvVisable';
import { keyValueListToJson, each, mapObj } from './uitl';
import validator,{validateField} from './validator';
import merge from './merge'

async function loadInitValues(getInitialValues, vm) {
    if (typeof getInitialValues !== "function") {
        return getInitialValues;
    }

    const result = await getInitialValues(vm);
    return result;
}

function getMutInfo(fieldName, vm) {
    const ids = mapObj(vm.formData.fields, (field) => {
        set.add(field.mut.id);
    }, false, (field) => {
        return field.mut && field.mut == fieldName
    })
    const priority = ids && ids.length ? ids[0].priority : undefined;
    let length = ids.length;
    if (length) {
        length = Math.max(...ids);
    }
    return { length, priority };
}

async function loadFields(getFields, values, vm) {
    if (typeof getFields !== "function") {
        return getFields;
    }

    const result = await getFields(values, vm);
    return result;
}

function createMutFields({
    fieldName,
    muts,
    priority,
    vm,
    mutId,
    values }) {
    // const mutId = mutInfo.length + 1;
    const fields = muts.getMutFields(fieldName, values, vm);
    const fieldArray = [];
    each(fields, (originField, orignFieldName) => {
        const fullName = `${orignFieldName}_$${mutId}$_`;
        const field = convertFieldConfigToField(fullName, originField, priority, vm);
        field.mut = {
            name: fieldName,
            id: mutId
        }
        fieldArray.push(field);
    })
    return fieldArray;
}


function convertFieldConfigToField(fieldName, config, priority, vm) {
    const field = {
        name: fieldName,
        ...config,
        visable: createVisable(config, vm),
        origin: config,
        error: null,
        priority
    }
    return field;
}

function convertFieldConfigToFields(fieldConfig, muts, vm) {
    let priority = 0;
    const fields = Object.keys(fieldConfig).map(key => {
        const field = fieldConfig[key];
        priority++;
        if (field.isMut) {
            let values=field.value;
            if(!values){
                values=muts.getMutFieldDefaultValues(key,vm);
            }

            let mutFields=[];
            let index=0;
            each(values,(value)=>{
                const prop = {
                    fieldName: key,
                    muts,
                    priority,
                    mutId:index++,
                    vm,
                    values: value
                }
                mutFields =mutFields.concat(createMutFields(prop));
            })
            return mutFields;
        } else {
            return [convertFieldConfigToField(key, field, priority, vm)]
        }
    });
    const daping = [].concat.apply([], fields);
    return keyValueListToJson(daping, (field) => {
        return {
            key: field.name,
            value: field
        }
    });
}

function appendMutFields(fieldName, values, muts, vm) {
    const {length,priority} = getMutInfo(fieldName, vm);
    const mutId=length+1;
    const fields = createMutFields({ fieldName, muts, values,priority,mutId, vm });
    each(fields, (field) => {
        vm.set(vm, `formData.${field.name}`, field);
    })
}

function deleteMutFields(fieldName, index, vm) {
    each(vm.formData.fields, (field, prop) => {
        if (field.mut && field.mut == fieldName && field.mut.id == index) {
            vm.delete(vm, `formData.${prop}`);
        }
    })
}

function getValues(vm) {
    const valueList = Object.keys(vm.formData.fields).map(key => {
        const { value, visable } = vm.formData.fields[key];
        return {
            key,
            value,
            visable
        }
    }).filter(item => item.visable(vm));
    const values = keyValueListToJson(valueList);
    return values;
}


function create({ getFields, getInitialValues, onSubmit, onChange, muts }) {
    return {
        data() {
            return {
                formData: {
                    fields: {},
                    loading: true,
                }
            }
        },
        async mounted() {
            const vm = this;
            vm.formData.loading = true;
            const initValues = await loadInitValues(getInitialValues, vm);
            const fieldConfig = await loadFields(getFields, initValues, vm);
            this.formData.fields = convertFieldConfigToFields(fieldConfig, muts, vm);
            vm.formData.loading = false;
        },

        methods: {
            async onChangeOrBlur(value, field, type) {
                const vm = this;
                field.value = value;
                if(onChange){
                    await onChange(value, field, type, vm)
                }
                const values = getValues(vm, type);
                const { trigger = "change" } = field;
                if (type === "all" || type === trigger) {
                    validateField(values, field, vm);
                }
            },

            onChange({ value, field }) {
                this.onChangeOrBlur(value, field, "change")
            },
            onItemBlur({ value, field }) {
                this.onChangeOrBlur(value, field, "blur")
            },

            appendMutFields(fieldName, values) {
                appendMutFields(fieldName, values, muts, this);
            },
            removeMutFields(fieldName, index) {
                deleteMutFields(fieldName, index, this);
            },

            async onSubmit() {
                const vm = this;
                const values = getValues(vm, "all");
                const [errors] = await validator(values, "all", vm);
                if (errors) {
                    return [errors];
                }
                try {
                    this.formData.loading = true;
                    const mergeValues = merge(values, vm.formData.fields);
                    await onSubmit(mergeValues, vm);
                    this.formData.loading = false;
                    return [null,mergeValues];
                }
                catch (error) {
                    this.formData.loading = false;
                    throw error;
                }

            }
        }
    }
}

export default create;