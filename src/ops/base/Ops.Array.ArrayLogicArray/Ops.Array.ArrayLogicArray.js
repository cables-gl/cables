// this op expects 2 arrays. The user can then pick a
// logical comparison which will be applied to the
// two arrays. If arrays have a different length then a warning
// is given in the panel
// pass allows the value from array 0 through if the
// comparison evaulates to true else zero

const inArray_0 = op.inArray("array 0"),
    inArray_1 = op.inArray("array 1"),
    inValueIfTrue = op.inFloat("value if true", 1.0),
    inValueIfFalse = op.inFloat("value if false", 0.0),
    mathSelect = op.inValueSelect("Comparison mode", [">", "<", ">=", "<=", "==", "!=",
        ">pass", "<pass", ">=pass", "<=pass", "==pass", "!=pass"], ">"),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

op.toWorkPortsNeedToBeLinked(inArray_1, inArray_0);

let logicFunc;
// cache for errors
let showingError = false;

// create array to store multiplied result from both arrays
let mathArray = [];
let selectIndex = 0;

mathSelect.onChange = onFilterChange;

inArray_0.onChange = inArray_1.onChange =
inValueIfTrue.onChange = inValueIfFalse.onChange = update;

onFilterChange();
function onFilterChange()
{
    let mathSelectValue = mathSelect.get();
    if (mathSelectValue === ">") logicFunc = function (val, comp, t, f) { if (val > comp) return t; return f; };
    else if (mathSelectValue === "<") logicFunc = function (val, comp, t, f) { if (val < comp) return t; return f; };
    else if (mathSelectValue === ">=") logicFunc = function (val, comp, t, f) { if (val >= comp) return t; return f; };
    else if (mathSelectValue === "<=") logicFunc = function (val, comp, t, f) { if (val <= comp) return t; return f; };
    else if (mathSelectValue === "==") logicFunc = function (val, comp, t, f) { if (val === comp) return t; return f; };
    else if (mathSelectValue === "!=") logicFunc = function (val, comp, t, f) { if (val !== comp) return t; return f; };
    else if (mathSelectValue === ">pass") logicFunc = function (val, comp, t, f) { if (val > comp) return val; return f; };
    else if (mathSelectValue === "<pass") logicFunc = function (val, comp, t, f) { if (val < comp) return val; return f; };
    else if (mathSelectValue === ">=pass") logicFunc = function (val, comp, t, f) { if (val >= comp) return val; return f; };
    else if (mathSelectValue === "<=pass") logicFunc = function (val, comp, t, f) { if (val <= comp) return val; return f; };
    else if (mathSelectValue === "==pass") logicFunc = function (val, comp, t, f) { if (val === comp) return val; return f; };
    else if (mathSelectValue === "!=pass") logicFunc = function (val, comp, t, f) { if (val !== comp) return val; return f; };

    update();
    op.setUiAttrib({ "extendTitle": mathSelectValue });
}

function update()
{
    let array0 = inArray_0.get();
    let array1 = inArray_1.get();

    let valueFalse = inValueIfFalse.get();
    let valueTrue = inValueIfTrue.get();

    mathArray.length = 0;

    if (!array0 || !array1)
    {
        outArray.set(null);
        outArrayLength.set(0);
        return;
    }

    if (CABLES.UI)
        if (array0.length !== array1.length) return op.setUiError("lengtherr", "Arrays do not have the same length !");
        else op.setUiError("lengtherr", null);

    mathArray.length = array0.length;

    let i = 0;

    for (i = 0; i < array0.length; i++)
    {
        mathArray[i] = logicFunc(array0[i], array1[i], valueTrue, valueFalse);
    }

    outArray.set(null);
    outArray.set(mathArray);
    outArrayLength.set(mathArray.length);
}
