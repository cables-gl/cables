const inArray = op.inArray("Array");
const inKeysToKeep = op.inStringEditor("Keys",'1,2,3');
const inSeperator = op.inString("Seperator", ",");
const inInvert = op.inBool("Invert Filter", false);
const outArray = op.outArray("Array Out");

const COMPARATOR_FUNC = (arr, key) => arr.includes(key);
const INV_COMPARATOR_FUNC = (arr, key) => !(arr.includes(key));

inArray.onChange = inKeysToKeep.onChange = inInvert.onChange = inSeperator.onChange =
function () {
    if (!inKeysToKeep.get()) return;
    const keys = inKeysToKeep.get().split(inSeperator.get());
    const inValue = inArray.get();

    if (Array.isArray(inValue)) {
        const newArray = [];
        const comparatorFunc = !inInvert.get() ? COMPARATOR_FUNC : INV_COMPARATOR_FUNC

        for (let i = 0, len = inValue.length; i < len; i += 1) {
            const obj = inValue[i];
            const objKeys = Object.keys(obj);
            const newObj = {};

            for (let j = 0, len2 = objKeys.length; j < len2; j += 1) {
                const key = objKeys[j];
                if (comparatorFunc(keys, key))
                    Object.assign(newObj, { [key]: obj[key] });
            }

            newArray.push(newObj);
        }

        outArray.set(null);
        outArray.set(newArray);
    }
    else {
        outArray.set(null);
    }
};
