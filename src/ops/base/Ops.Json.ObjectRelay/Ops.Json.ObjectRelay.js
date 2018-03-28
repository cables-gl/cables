// input
var objectInPort = op.inObject('Object In');
var enabledPort = op.inValueBool('Enabled');

// output
var objectOutPort = op.outObject('Object Out');

// change listener
objectInPort.onChange = setOutPort;
enabledPort.onChange = setOutPort;

function setOutPort() {
    var enabled = enabledPort.get();
    if(enabled) {
        objectOutPort.set(objectInPort.get());    
    } else {
        objectOutPort.set(null);
    }
}