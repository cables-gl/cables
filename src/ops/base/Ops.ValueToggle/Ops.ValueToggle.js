op.name="ValueToggle";

// inputs
var value0port = op.inValue("Value 0", 0);
var value1port = op.inValue("Value 1", 1);
var useValue1Port = op.inValueBool("Use Value 1", false);

// outputs
var outValuePort = op.outValue("Out Value", 0);

// functions
function setOutput() {
    var useValue1 = useValue1Port.get();
    if(useValue1) {
        outValuePort.set(value1port.get());
    } else {
        outValuePort.set(value0port.get());
    }
}

// change listeners
value0port.onChange = setOutput;
value1port.onChange = setOutput;
useValue1Port.onChange = setOutput;