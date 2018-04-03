// constatnts
var NUM_PORTS = 10;

// inputs
var exePort = op.inFunctionButton('Execute');
var enablePorts = [];
createInPorts();

// outputs
var triggerBeforePort = op.outFunction('Trigger Before');
var triggerPorts = [];
createOutPorts();
var triggerAfterPort = op.outFunction('Trigger After');

// listeners
exePort.onTriggered = setOutPorts;

// functions

function setOutPorts() {
    triggerBeforePort.trigger();
    for(var i=0; i<NUM_PORTS; i++) {
        if(enablePorts[i].get()) {
            triggerPorts[i].trigger();
        }
    }
    triggerAfterPort.trigger();
}

function createInPorts() {
    for(var i=0; i<NUM_PORTS; i++) {
        var port = op.inValueBool('Enable ' + i, false);
        enablePorts.push(port);
    }
}

function createOutPorts() {
    for(var i=0; i<NUM_PORTS; i++) {
        var port = op.outFunction('Trigger ' + i);
        triggerPorts.push(port);
    }
}

