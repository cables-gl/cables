op.name="ScheduleRepeat";

CABLES.WEBAUDIO.createAudioContext(op);

var INFINITE = "Infinite";
var START_TIME_DEFAULT = "0";

// input ports
var intervalPort = op.inValueString("Interval", "4n");
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var durationPort = op.inValueString("Duration", INFINITE);

// output ports
var triggerPort = op.outTrigger("Trigger");
var timeOutPort = op.outValue("Event Time");

// vars
var lastListenerId;

// change listsners
intervalPort.onChange = handleChange;
startTimePort.onChange = handleChange;
durationPort.onChange = handleChange;

// functions
function handleChange() {
    var duration = durationPort.get();
    var interval =  intervalPort.get();
    var startTime = startTimePort.get();
    
    if(!interval || interval == 0) {
        op.log("Warning: Interval should not be 0!");
        return;
    }
    
    // check if interval is valid
    try{
	    var time = new Tone.TimeBase(interval);	
    } catch(e) {
        // interval not valid
        op.uiAttr( { 'error': 'Interval not valid, Examples: "4n", "1m", 2' } );
        if(window && window.gui && gui.patch) gui.patch().showOpParams(op); // update GUI
    	return;
    }
    // reset UI warning
    op.uiAttr( { 'error': null } );
    if(window && window.gui && gui.patch) gui.patch().showOpParams(op); // update GUI
    
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
    op.log("Creating new interval with interval: " + interval);
    if(isValidTime(startTime)) {
        if(duration && duration !== INFINITE) {
            lastListenerId = Tone.Transport.scheduleRepeat(
                cb, 
                interval, 
                startTime
            );    
        } else {
            lastListenerId = Tone.Transport.scheduleRepeat(
                cb, 
                interval, 
                startTime
            );
        }
    } else {
        lastListenerId = Tone.Transport.scheduleRepeat(
            cb, 
            interval
        );  
    }
}

handleChange();

// functions
function isValidTime(time) {
    try {
        new Tone.TimeBase(time);
        return true;
    } catch(e) {
        return false;
    }
}


