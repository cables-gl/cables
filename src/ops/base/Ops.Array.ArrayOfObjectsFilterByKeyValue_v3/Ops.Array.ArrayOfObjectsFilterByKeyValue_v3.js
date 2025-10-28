const CMP_EQUALS = "equals";
const CMP_INCLUDES = "includes";
const CMP_STARTSWITH = "startsWith";
const CMP_ENDSWITH = "endsWith";

const
    inArray = op.inArray("Array"),
    inKeyToFilterBy = op.inString("Filter Key", ""),
    inFilterStr = op.inString("Filter Value", ""),
    inKeyCompare = op.inSwitch("Method", [CMP_EQUALS, CMP_STARTSWITH, CMP_ENDSWITH, CMP_INCLUDES], CMP_EQUALS),
    inInvertEquality = op.inBool("Invert Filter", false),
    outArray = op.outArray("arrayOut");

const COMP_FUNC_EQUALS = (obj, comparator, key) => { return obj && obj[key] && obj[key] == comparator; };
const COMP_FUNC_EQUALS_INV = (obj, comparator, key) => { return obj && obj[key] && (obj[key] != comparator); };
const COMP_FUNC_INCLUDES = (obj, comparator, key) => { return obj && obj[key] && obj[key].includes(comparator); };
const COMP_FUNC_INCLUDES_INV = (obj, comparator, key) => { return obj && obj[key] && (!obj[key].includes(comparator)); };

const COMP_FUNC_STARTSWITH = (obj, comparator, key) => { return obj && obj[key] && obj[key].startsWith(comparator); };
const COMP_FUNC_STARTSWITH_INV = (obj, comparator, key) => { return obj && obj[key] && (!obj[key].startsWith(comparator)); };

const COMP_FUNC_ENDSWITH = (obj, comparator, key) => { return obj && obj[key] && obj[key].endsWith(comparator); };
const COMP_FUNC_ENDSWITH_INV = (obj, comparator, key) => { return obj && obj[key] && (!obj[key].endsWith(comparator)); };

inKeyCompare.onChange =
inArray.onChange =
inInvertEquality.onChange =
inKeyToFilterBy.onChange =
inFilterStr.onChange = function ()
{
    const inValue = inArray.get();
    if (!inValue) return;

    if (Array.isArray(inValue))
    {
        const key = inKeyToFilterBy.get();

        let comparatorFunction = CMP_EQUALS;
        if (inKeyCompare.get() == CMP_EQUALS)
            if (!inInvertEquality.get()) comparatorFunction = COMP_FUNC_EQUALS;
            else comparatorFunction = COMP_FUNC_EQUALS_INV;

        if (inKeyCompare.get() == CMP_INCLUDES)
            if (!inInvertEquality.get()) comparatorFunction = COMP_FUNC_INCLUDES;
            else comparatorFunction = COMP_FUNC_INCLUDES_INV;

        if (inKeyCompare.get() == CMP_STARTSWITH)
            if (!inInvertEquality.get()) comparatorFunction = COMP_FUNC_STARTSWITH;
            else comparatorFunction = COMP_FUNC_STARTSWITH_INV;

        if (inKeyCompare.get() == CMP_ENDSWITH)
            if (!inInvertEquality.get()) comparatorFunction = COMP_FUNC_ENDSWITH;
            else comparatorFunction = COMP_FUNC_ENDSWITH_INV;

        const filteredArray = [];
        const filterStr = inFilterStr.get();
        for (let i = 0, len = inValue.length; i < len; i += 1)
        {
            const obj = inValue[i];
            if (comparatorFunction(obj, filterStr, key)) filteredArray.push(obj);
        }

        outArray.setRef(filteredArray);
    }
    else
    {
        outArray.set(null);
    }
};
