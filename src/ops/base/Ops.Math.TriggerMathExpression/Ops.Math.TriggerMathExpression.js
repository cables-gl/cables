const inExec = op.inTrigger("Calculate"),
    inExpression = op.inString("Expression", "x*(y+z)"),

    inX = op.inFloat("X", 0),
    inY = op.inFloat("Y", 0),
    inZ = op.inFloat("Z", 0),
    inW = op.inFloat("W", 0),

    inA = op.inFloat("A", 0),
    inB = op.inFloat("B", 0),
    inC = op.inFloat("C", 0),
    inD = op.inFloat("D", 0),

    inI = op.inFloat("I", 0),

    next = op.outTrigger("Next"),
    outResult = op.outNumber("Result"),
    outExpressionIsValid = op.outBool("Expression Valid");

op.setPortGroup("Parameters", [inA, inB, inC, inD, inX, inY, inZ, inW, inI]);

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

        functionValid = true;
        // evaluateFunction();
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
        outResult.set(currentFunction(Math, inA.get(), inB.get(), inC.get(), inD.get(), inX.get(), inY.get(), inZ.get(), inW.get(), inI.get()));
        if (!inExpression.get()) outResult.set(0);
    }

    outExpressionIsValid.set(functionValid);
    next.trigger();
}
