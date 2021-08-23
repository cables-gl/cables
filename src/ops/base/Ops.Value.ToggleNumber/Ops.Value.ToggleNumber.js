// inputs
const useValue1Port = op.inValueBool("Use Value 1", false);
const value0port = op.inValue("Value 0", 0);
const value1port = op.inValue("Value 1", 1);

// outputs
const outValuePort = op.outValue("Out Value", 0);

// functions
function setOutput()
{
    const useValue1 = useValue1Port.get();
    if (useValue1)
    {
        outValuePort.set(value1port.get());
    }
    else
    {
        outValuePort.set(value0port.get());
    }
}

// change listeners
value0port.onChange = setOutput;
value1port.onChange = setOutput;
useValue1Port.onChange = setOutput;
