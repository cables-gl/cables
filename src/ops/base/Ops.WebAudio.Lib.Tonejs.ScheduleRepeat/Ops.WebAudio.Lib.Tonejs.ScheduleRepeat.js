op.name="ScheduleRepeat";

CABLES.WebAudio.createAudioContext(op);

window.blatest=true;

var INFINITE = "Infinite";

// input ports
var intervalPort = op.inValueString("Interval", "4n");
var startTimePort = op.inValueString("Start Time", "0");
var durationPort = op.inValueString("Duration", INFINITE);

// output ports
var triggerPort = op.outFunction("Trigger");
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
        return;
    }
    
    // check if interval is valid
    try{
	var time = new Tone.TimeBase(interval);	
    } catch(e) {
        // interval not valid
        op.uiAttr( { 'error': 'Interval not valid, Examples: "4n", "1m", 2' } );
        gui.patch().showOpParams(op); // update GUI
    	return;
    }
    // reset UI warning
    op.uiAttr( { 'error': null } );
    gui.patch().showOpParams(op); // update GUI
    
    // clear old schedule
    if(lastListenerId) {
        Tone.Transport.clear(lastListenerId);
        lastListenerId = undefined;
    }
    // create new schedule
    var cb = function(time) {
        timeOutPort.set(time);
	    triggerPort.trigger();
	    op.log("cb: ", intervalPort.get());
    };
    if(startTime && startTime.length && startTime.length>0) {
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


