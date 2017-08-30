op.name = "ValueSwitcher";

var indexPort = op.inValueInt("Index");
var resultPort = op.outValue("Result");

var NUM_PORTS = 10;
var valuePorts = [];

for(var i=0; i<NUM_PORTS; i++) {
    var p = op.inValue("Value " + i);
    valuePorts.push(p);
    p.onChange = update;
}

indexPort.onChange = update;

function update() {
    var index = indexPort.get();
    var indexNumber = Number(index); // make sure it really is a number
    op.log("index: ", index);
    if(!isNaN(indexNumber) && indexNumber >= 0 && indexNumber < NUM_PORTS) {
        op.log("valuePorts[index]", valuePorts[indexNumber]);
        resultPort.set(valuePorts[indexNumber].get());
    }
    
}