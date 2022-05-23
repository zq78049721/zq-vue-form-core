
import createVisable from './createvVisable';
import { keyValueListToJson } from './uitl';
import validator from './validator';

async function loadInitValues(getInitialValues, vm) {
    if (typeof getInitialValues !== "function") {
        return getInitialValues;
    }

    const result = await getInitialValues(vm);
    return result;
}

async function loadFields(getFields, values, vm) {
    if (typeof getFields !== "function") {
        return getFields;
    }

    const result = await getFields(values, vm);
    return result;
}


function convertFieldConfigToField(fieldName, config, vm) {
    const field = {
        name: fieldName,
        ...config,
        visable: createVisable(config, vm),
        origin: config,
        error: null
    }
    return field;
}

function convertFieldConfigToFields(fieldConfig, vm) {
    const keyValues = Object.keys(fieldConfig).map(key => {
        const field = fieldConfig[key];
        return {
            key,
            value: convertFieldConfigToField(key, field, vm)
        }
    });
    return keyValueListToJson(keyValues);
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


function create({ getFields, getInitialValues, onSubmit, onChange }) {
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
            this.formData.fields = convertFieldConfigToFields(fieldConfig, vm);
            vm.formData.loading = false;
        },

        methods: {
            async onChangeOrBlur(value, field, type) {
                const vm = this;
                field.value = value;
                await onChange(value, field, type, vm)
                const values = getValues(vm, type);
                const { trigger = "change" } = field;
                if (type === "all" || type === trigger) {
                    validator(values, type, vm);
                }

            },

            onChange({ value, field }) {
                this.onChangeOrBlur(value, field, "change")
            },
            onItemBlur({ value, field }) {
                this.onChangeOrBlur(value, field, "blur")
            },

            async onSubmit() {
                const vm = this;
                const values = getValues(vm, "all");
                const [errors] = await validator(values, "all", vm);
                if (errors) {
                    return;
                }
                try {
                    this.formData.loading = true;
                    await onSubmit(values, vm);
                    this.formData.loading = false;
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