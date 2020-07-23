const inA = op.inFloat("A", 0);
const inB = op.inFloat("B", 1);
const inC = op.inFloat("C", 2);
const inD = op.inFloat("D", 3);
op.setPortGroup("Parameters", [inA, inB, inC, inD]);
const inEquation = op.inString("Equation", "a*(b+c+d)");
op.setPortGroup("Equation", [inEquation]);
const outResult = op.outNumber("Result");
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

const evaluateFunction = () =>
{
    if (functionValid)
    {
        outResult.set(currentFunction(Math, inA.get(), inB.get(), inC.get(), inD.get()));
        if (!inEquation.get()) outResult.set(0);
    }

    outEquationIsValid.set(functionValid);
};


inA.onChange = inB.onChange = inC.onChange = inD.onChange = evaluateFunction;
inEquation.onChange = createFunction;
