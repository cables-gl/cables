const inArray = op.inArray("Array");
const inKeyToFilterBy = op.inString("Filter Key", "");
const inKeyShouldEqual = op.inString("Filter Value", "");
const inInvertEquality = op.inBool("Invert Filter", false);
const outArray = op.outArray("arrayOut");

const COMPARATOR_FUNC = (obj, comparator, key) => { return obj && obj[key] == comparator; };
const INV_COMPARATOR_FUNC = (obj, comparator, key) => { return obj && (obj[key] != comparator); };

inArray.onChange = inInvertEquality.onChange
= inKeyToFilterBy.onChange = inKeyShouldEqual.onChange = function ()
    {
        const inValue = inArray.get();
        if (!inValue)
        {
            return;
        }

        if (Array.isArray(inValue))
        {
            const key = inKeyToFilterBy.get();

            const comparatorFunction = !inInvertEquality.get() ?
                COMPARATOR_FUNC : INV_COMPARATOR_FUNC;

            const filteredArray = [];
            const keyToEqual = inKeyShouldEqual.get();
            for (let i = 0, len = inValue.length; i < len; i += 1)
            {
                const obj = inValue[i];
                if (comparatorFunction(obj, keyToEqual, key))
                {
                    filteredArray.push(obj);
                }
            }

            // outArray.set(null);
            outArray.setRef(filteredArray);
        }
        else
        {
            outArray.set(null);
        }
    };
