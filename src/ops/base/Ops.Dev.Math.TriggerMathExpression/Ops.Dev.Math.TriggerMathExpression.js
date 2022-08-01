const inExec = op.inTrigger("Calculate");
const inX = op.inFloat("X", 0);
const inY = op.inFloat("Y", 0);
const inZ = op.inFloat("Z", 0);
const inW = op.inFloat("W", 0);

const inA = op.inFloat("A", 0);
const inB = op.inFloat("B", 0);
const inC = op.inFloat("C", 0);
const inD = op.inFloat("D", 0);

const inI = op.inFloat("I", 0);

const inExpression = op.inString("Expression", "a*(b+c+d)");
const outResult = op.outNumber("Result");
const outExpressionIsValid = op.outBool("Expression Valid");
const next = op.outTrigger("Next");

op.setPortGroup("Parameters", [inA, inB, inC, inD, inX, inY, inZ, inW, inI]);
op.setPortGroup("Expression", [inExpression]);

let currentFunction = inExpression.get();
let functionValid = false;

inExec.onTriggered = evaluateFunction;
inExpression.onChange = createFunction;

createFunction();

function createFunction()
{
    try
    {
        currentFunction = new Function("m", "a", "b", "c", "d", "x", "y", "z", "w", "i", "with(m) { return " + inExpression.get() + " }");

        console.log(currentFunction);
        functionValid = true;
        evaluateFunction();
        outExpressionIsValid.set(functionValid);
    }
    catch (e)
    {
        functionValid = false;
        outExpressionIsValid.set(functionValid);
        if (e instanceof ReferenceError || e instanceof SyntaxError) return;
    }
}

function evaluateFunction()
{
    if (functionValid)
    {
        // console.log(inA.get(), inB.get(), inC.get(), inD.get());
        outResult.set(currentFunction(Math, inA.get(), inB.get(), inC.get(), inD.get(), inX.get(), inY.get(), inZ.get(), inI.get()));
        if (!inExpression.get()) outResult.set(0);
    }

    outExpressionIsValid.set(functionValid);
}
