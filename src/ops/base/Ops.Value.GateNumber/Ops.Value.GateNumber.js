// input
var valueInPort = op.inValue('Value In', 0);
var passThroughPort = op.inValueBool('Pass Through');

// output
var valueOutPort = op.outValue('Value Out');

// change listeners
valueInPort.onChange = update;
passThroughPort.onChange = update;


valueOutPort.changeAlways=true;


function update() {
    if(passThroughPort.get()){
        valueOutPort.set(valueInPort.get());
    }
}