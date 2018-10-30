// inputs
var executePort = op.inTriggerButton('Execute');
executePort.onTriggered = update;
var eventInPort = op.inObject('Event In');

//outputs
var nextPort = op.outTrigger('Next');
var eventOutPort = op.outObject('Event Out');

function update() {
    var event = eventInPort.get();
    if(event && event.preventDefault) {
        event.preventDefault();
    }
    eventOutPort.set(event);
    nextPort.trigger();
}

