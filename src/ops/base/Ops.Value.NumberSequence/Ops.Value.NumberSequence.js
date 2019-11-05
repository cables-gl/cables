var NUM_PORTS = 4;

// inputs
var inPort = op.inValue('In Value');

// outputs
var outPorts = [];
for(var i=0; i<NUM_PORTS; i++) {
    outPorts.push(op.outValue('Out Value ' + i));
}
var outTrigger = op.outTrigger('Value Changed');

// change listener
inPort.onChange = function() {
    var inValue = inPort.get();
    for(var i=0; i<NUM_PORTS; i++) {
        outPorts[i].set(inValue);
    }   
    outTrigger.trigger();
};