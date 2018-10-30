var DEFAULT_NTH = 5;

// inputs
var exePort = op.inTriggerButton('Execute');
var nthPort = op.inValue('Nth', DEFAULT_NTH);

// outputs
var triggerPort = op.outTrigger('Next');

var count = 0;
var nth = DEFAULT_NTH;

exePort.onTriggered = onExeTriggered;
nthPort.onChange = valueChanged;

function onExeTriggered() {
    count++;
    if(count % nth === 0) {
        count = 0;
        triggerPort.trigger();
    }
}

function valueChanged() {
    nth = nthPort.get();
    count = 0;
}