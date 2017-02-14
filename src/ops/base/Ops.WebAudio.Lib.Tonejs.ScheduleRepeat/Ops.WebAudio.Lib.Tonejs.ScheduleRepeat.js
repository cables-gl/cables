op.name="ScheduleRepeat";

CABLES.WebAudio.createAudioContext(op);

window.blatest=true;

// input ports
var intervalPort = op.inValueString("Interval");
var startTimePort = op.inValueString("Start Time");
var durationPort = op.inValueString("Duration");

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
        if(duration) {
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


