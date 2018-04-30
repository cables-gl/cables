var chain = null;
var firstRound = true;

// inputs
var valuesPort = op.inObject('Values');
var startPort = op.inValueString('Start Value');
var nextPort = op.inFunctionButton('Next');

// outputs
var outValuePort = op.outValueString('Next Value');

valuesPort.onChange = function() {
    if(valuesPort.get()) {
        chain = new Tone.CtrlMarkov(valuesPort.get());   
    } else {
        chain = null;
    }
};

nextPort.onTriggered = function() {
    if(!chain) { return; } // TODO: Show UI error
    var outValue = '';
    if(firstRound) {
        var startValue = startPort.get(); 
        if(typeof startValue !== 'undefined' && valuesPort.get().hasOwnProperty(startValue)) {
            chain.value = startValue; // if start value is defined an valid, use it
        }
        firstRound = false;
    }
    outValuePort.set(chain.next());
}

// clean up
op.onDelete = function() {
    if(chain) {
        chain.dispose();
    }
};
