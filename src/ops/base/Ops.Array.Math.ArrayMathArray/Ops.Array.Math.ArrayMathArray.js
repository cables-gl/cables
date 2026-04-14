const inArray_0 = op.inArray("array 0"),
    inArray_1 = op.inArray("array 1"),
    mathSelect = op.inSwitch("Math function", ["+", "-", "*", "/", "%", "min", "max"], "+"),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

let mathFunc;

let showingError = false;

const mathArray = [];

op.toWorkPortsNeedToBeLinked(inArray_1, inArray_0);

mathSelect.onChange = onFilterChange;

inArray_0.onChange = inArray_1.onChange = update;
onFilterChange();

function onFilterChange()
{
    const mathSelectValue = mathSelect.get();

    if (mathSelectValue === "+") mathFunc = function (a, b) { return a + b; };
    else if (mathSelectValue === "-") mathFunc = function (a, b) { return a - b; };
    else if (mathSelectValue === "*") mathFunc = function (a, b) { return a * b; };
    else if (mathSelectValue === "/") mathFunc = function (a, b) { return a / b; };
    else if (mathSelectValue === "%") mathFunc = function (a, b) { return a % b; };
    else if (mathSelectValue === "min") mathFunc = function (a, b) { return Math.min(a, b); };
    else if (mathSelectValue === "max") mathFunc = function (a, b) { return Math.max(a, b); };
    update();
    op.setUiAttrib({ "extendTitle": mathSelectValue });
}

function update()
{
    const array0 = inArray_0.get();
    const array1 = inArray_1.get();

    if (!array0 || !array1)
    {
        outArray.set(null);
        outArrayLength.set(0);
        return;
    }

    const l = mathArray.length = array0.length;

    for (let i = 0; i < l; i++)
    {
        mathArray[i] = mathFunc(array0[i], array1[i]);
    }

    outArrayLength.set(mathArray.length);
    outArray.setRef(mathArray);
}
