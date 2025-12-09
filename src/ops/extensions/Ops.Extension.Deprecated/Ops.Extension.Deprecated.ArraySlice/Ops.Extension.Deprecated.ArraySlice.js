// inputs
let inArrayPort = op.inArray("Input Array");
let beginPort = op.inValue("Begin Index", 0);
let endPort = op.inValue("End Index", 1);

// functions
function setOutarray()
{
    let inArr = inArrayPort.get();
    let begin = beginPort.get();
    let end = endPort.get();

    if (!Array.isArray(inArr))
    {
        outArrayPort.set(null);
        return;
    }
    outArrayPort.set(null);
    outArrayPort.set(inArr.slice(begin, end));
}

// change listeners
inArrayPort.onChange = setOutarray;
beginPort.onChange = setOutarray;
endPort.onChange = setOutarray;

// outputs
var outArrayPort = op.outArray("Output Array");
