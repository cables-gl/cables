const
    inTrigger = op.inTrigger("Update"),
    inA = op.inArray("A"),
    inB = op.inArray("B"),
    inC = op.inArray("C"),

    inX = op.inFloat("X", 1),
    inY = op.inFloat("Y", 1),
    inZ = op.inFloat("Z", 1),

    inExpression = op.inString("Expression", "a*(b+c+d)"),

    outNext = op.outTrigger("Next"),

    outResultArray = op.outArray("Result Array"),
    outLength = op.outNumber("Array Length"),
    outExpressionIsValid = op.outBool("Expression Valid");

op.setPortGroup("Expression", [inExpression]);
op.setPortGroup("Parameters", [inA, inB, inC, inX, inY, inZ]);

const functionChanged = false;
const inputsChanged = false;
const resultArray = [];
let currentFunction = inExpression.get();
let functionValid = false;
let showingError = false;
let needsupdate = true;

inA.onChange = inB.onChange = inC.onChange
    = inX.onChange = inY.onChange = inZ.onChange = () => { needsupdate = true; };

inTrigger.onTriggered = evaluateFunction;
inExpression.onChange = createFunction;

function createFunction()
{
    try
    {
        currentFunction = new Function("m", "a", "b", "c", "x", "y", "z", "i", "len", `with(m) { return ${inExpression.get()} }`);
        functionValid = true;
        evaluateFunction();

        outExpressionIsValid.set(functionValid);
    }
    catch (e)
    {
        functionValid = false;

        outExpressionIsValid.set(functionValid);
        outResultArray.set(null);

        if (e instanceof ReferenceError || e instanceof SyntaxError) return;
    }
}

function evaluateFunction()
{
    if (needsupdate)
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
                op.setUiError("notsamelength", null);
                const firstValidArray = arrays.find(Boolean);
                validArrays = arrays.map((arr, index) =>
                {
                // * map all undefined arrays to 0 values
                    if (!arr) arr = arrays.find(Boolean).map((x) => 0);

                    return arr;
                });

                resultArray.length = firstValidArray.length;

                if (functionValid)
                {
                    for (let i = 0; i < firstValidArray.length; i += 1)
                    {
                        resultArray[i] = currentFunction(
                            Math,
                            validArrays[0][i], validArrays[1][i], validArrays[2][i],
                            x, y, z,
                            i,
                            resultArray.length
                        );
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
                op.setUiError("notsamelength", "Arrays do not have the same length!", 2);
                showingError = true;
            }
        }

        outExpressionIsValid.set(functionValid);
        needsupdate = false;
    }
    outNext.trigger();
}
