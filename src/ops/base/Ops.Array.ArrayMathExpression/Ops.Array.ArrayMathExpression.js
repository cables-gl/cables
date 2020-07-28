const inA = op.inArray("A");
const inB = op.inArray("B");
const inC = op.inArray("C");
const inD = op.inArray("D");
op.setPortGroup("Parameters", [inA, inB, inC, inD]);
const inEquation = op.inString("Equation", "a*(b+c+d)");
op.setPortGroup("Equation", [inEquation]);
const outResult = op.outArray("Result");
const outLength = op.outNumber("Array Length");
const outEquationIsValid = op.outBool("Equation Valid");
const outEquation = op.outString("Equation");

let currentFunction = inEquation.get();
let functionValid = false;

const createFunction = () =>
{
    try
    {
        currentFunction = new Function("m", "a", "b", "c", "d", `with(m) { return ${inEquation.get()} }`);
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
let showingErrorLength = false;

const evaluateFunction = () =>
{
    const arrayA = inA.get();
    const arrayB = inB.get();
    const arrayC = inC.get();
    const arrayD = inD.get();

    const arrays = [arrayA, arrayB, arrayC, arrayD];

    // * check if we have at least 2 arrays that are valid
    if (arrays.filter(Boolean).length < 2)
    {
        outResult.set(null);
        outLength.set(0);
        if (!showingErrorLength) op.uiAttr({ "error": "Cannot calculate with less than two arrays !" });
        showingErrorLength = true;
        return;
    }
    else
    {
        if (showingErrorLength)
        {
            op.uiAttr({ "error": null });
            showingErrorLength = false;
        }

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
                if (!arr)
                {
                    // * map all undefined arrays to 0 values
                    arr = arrays.find(Boolean).map((x) => 0);
                }
                return arr;
            });

            resultArray.length = firstValidArray.length;

            if (functionValid)
            {
                for (let i = 0; i < firstValidArray.length; i += 1)
                {
                    resultArray[i] = currentFunction(Math, validArrays[0][i], validArrays[1][i], validArrays[2][i], validArrays[3][i]);
                }
                outResult.set(null);
                outResult.set(resultArray);
                outLength.set(resultArray.length);
            }
        }
        else
        {
            outResult.set(null);
            outLength.set(0);
            op.uiAttr({ "error": "Arrays do not have the same length !" });
            showingError = true;
        }
    }

    outEquationIsValid.set(functionValid);
};


inA.onChange = inB.onChange = inC.onChange = inD.onChange = evaluateFunction;
inEquation.onChange = createFunction;
