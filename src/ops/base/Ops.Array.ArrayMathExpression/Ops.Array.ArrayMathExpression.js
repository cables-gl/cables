const inTrigger = op.inTrigger("Trigger In");
const inA = op.inArray("A");
const inB = op.inArray("B");
const inC = op.inArray("C");

const inX = op.inFloat("X", 1);
const inY = op.inFloat("Y", 1);
const inZ = op.inFloat("Z", 1);

op.setPortGroup("Parameters", [inA, inB, inC, inX, inY, inZ]);
const inEquation = op.inString("Equation", "a*(b+c+d)");
op.setPortGroup("Equation", [inEquation]);

const outTrigger = op.outTrigger("Trigger Out");
const outResultFloat = op.outNumber("Result Number");
const outResultArray = op.outArray("Result Array");
const outLength = op.outNumber("Array Length");
const outCurrentIndex = op.outNumber("Current Index");
const outResultPerIndex = op.outNumber("Result per Index");
const outEquationIsValid = op.outBool("Equation Valid");
const outEquation = op.outString("Equation");

let currentFunction = inEquation.get();
let functionValid = false;
let functionChanged = false;
let inputsChanged = false;

const createFunction = () =>
{
    try
    {
        currentFunction = new Function("m", "a", "b", "c", "x", "y", "z", `with(m) { return ${inEquation.get()} }`);
        functionValid = true;
        evaluateFunction();
        outEquation.set(inEquation.get());
        outEquationIsValid.set(functionValid);
    }
    catch (e)
    {
        functionValid = false;
        outEquation.set("");
        outEquationIsValid.set(functionValid);
        if (e instanceof ReferenceError || e instanceof SyntaxError) return;
    }
};

const resultArray = [];
let showingError = false;
const showingErrorLength = false;

const evaluateFunction = () =>
{
    const arrayA = inA.get();
    const arrayB = inB.get();
    const arrayC = inC.get();
    const arrays = [arrayA, arrayB, arrayC];

    const x = inX.get();
    const y = inY.get();
    const z = inZ.get();

    // * check if we have at least 2 arrays that are valid
    if (arrays.filter(Boolean).length === 0)
    {
        outResultArray.set(null);
        outLength.set(0);


        outResultArray.set(null);
        outCurrentIndex.set(0);
        if (functionValid)
            outResultFloat.set(
                currentFunction(Math, null, null, null, x, y, z)
            );

        return;
    }
    else
    {
        const arrayLengths = arrays.map((arr) => (arr ? arr.length : undefined));
        const firstValidArrayLength = arrayLengths.find(Boolean);
        const sameLength = arrayLengths.filter(Boolean).every((length) => length === firstValidArrayLength);

        let validArrays = [];

        if (sameLength)
        {
            if (showingError)
            {
                op.uiAttr({ "error": null });
                showingError = false;
            }


            const firstValidArray = arrays.find(Boolean);

            validArrays = arrays.map((arr, index) =>
            {
                // * map all undefined arrays to 0 values
                if (!arr)
                    arr = arrays.find(Boolean).map((x) => 0);

                return arr;
            });

            resultArray.length = firstValidArray.length;

            if (functionValid)
            {
                for (let i = 0; i < firstValidArray.length; i += 1)
                {
                    resultArray[i] = currentFunction(
                        Math,
                        validArrays[0][i],
                        validArrays[1][i],
                        validArrays[2][i],
                        x,
                        y,
                        z
                    );

                    outCurrentIndex.set(i);
                    outResultPerIndex.set(resultArray[i]);
                }
                outResultArray.set(null);
                outResultArray.set(resultArray);
                outLength.set(resultArray.length);
            }
        }
        else
        {
            outResultArray.set(null);
            outLength.set(0);
            outCurrentIndex.set(0);
            op.uiAttr({ "error": "Arrays do not have the same length !" });
            showingError = true;
        }
    }

    outEquationIsValid.set(functionValid);
};

inTrigger.onTriggered = () =>
{
    if (functionChanged)
    {
        createFunction();
        functionChanged = false;
    }

    if (inputsChanged)
    {
        evaluateFunction();
        inputsChanged = false;
    }
};

inA.onChange = inB.onChange = inC.onChange
= inX.onChange = inY.onChange = inZ.onChange = () => inputsChanged = true;
// evaluateFunction;
inEquation.onChange = () => functionChanged = true;
