// inputs
var executePort = op.inFunctionButton('Execute');
executePort.onTriggered = update;
var eventInPort = op.inObject('Event In');

//outputs
var nextPort = op.outFunction('Next');
var eventOutPort = op.outObject('Event Out');

function update() {
    var event = eventInPort.get();
    if(event && event.stopPropagation) {
        event.stopPropagation();
        op.log('Stopped Propa', event);
    }
    eventOutPort.set(event);
    nextPort.trigger();
}

