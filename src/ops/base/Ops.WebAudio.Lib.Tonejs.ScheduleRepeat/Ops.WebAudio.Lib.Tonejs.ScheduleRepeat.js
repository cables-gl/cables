op.name="ScheduleRepeat";

CABLES.WebAudio.createAudioContext(op);
Tone.setContext(window.audioContext);

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
    op.log("duration: ", duration);
    op.log("interval: ", interval);
    op.log("startTime: ", startTime);
    op.log("---");
    
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
    
    if(startTime) {
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
        op.log("setting schedule for interval: ", interval);
        lastListenerId = Tone.Transport.scheduleRepeat(
            cb, 
            interval
        );  
    }
}

handleChange();


