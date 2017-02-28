op.name="Schedule";

CABLES.WebAudio.createAudioContext(op);

var INFINITE = "Infinite";
var START_TIME_DEFAULT = "0";

// input ports
var timePort = op.inValueString("Time", "0:0:0");

// output ports
var triggerPort = op.outFunction("Trigger");
var timeOutPort = op.outValue("Event Time");

// vars
var lastListenerId;

// change listsners
timePort.onChange = handleChange;

// functions
function handleChange() {
    var time = timePort.get();
    
    // check if time is valid
    if(!CABLES.WebAudio.isValidToneTime(time)) {
        op.uiAttr( { 'error': 'Time not valid, Example: "0:1:0' } );
        if(window && window.gui && gui.patch) gui.patch().showOpParams(op); // update GUI    
        return;
    } else {
        op.uiAttr( { 'error': null } );
        if(window && window.gui && gui.patch) gui.patch().showOpParams(op); // update GUI
    }

    // clear old schedule
    if(lastListenerId) {
        Tone.Transport.clear(lastListenerId);
        lastListenerId = undefined;
    }
    // create new schedule
    var cb = function(time) {
        timeOutPort.set(time);
	    triggerPort.trigger();
    };
    
    lastListenerId = Tone.Transport.schedule(
        cb, 
        time
    );    
}

handleChange();



