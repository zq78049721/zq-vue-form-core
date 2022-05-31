import { each } from './uitl';

function create(muts) {
    const mutsStore = new Map();

    each(muts, (config, propName) => {
        mutsStore.set(propName, config);
    })

    function getMutFields(fieldName, values,vm) {
        if (!mutsStore.has(fieldName)) {
            return null;
        }
        const { getMutFields } = mutsStore.get(fieldName);
        const mutFields = getMutFields(values,vm);
        return mutFields;
    }

    function getMutFieldDefaultValues(fieldName,vm) {
        if (!mutsStore.has(fieldName)) {
            return null;
        }
        const { getDefaultValue } = mutsStore.get(fieldName);
        return getDefaultValue(vm);
    }

    return {
        getMutFields,
        getMutFieldDefaultValues
    }
}

export default create;