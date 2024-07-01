CABLES.WEBAUDIO.createAudioContext(op);

let INFINITE = "Infinite";
let START_TIME_DEFAULT = "0";

// input ports
let timePort = op.inValueString("Time", "0:0:0");

// output ports
let triggerPort = op.outTrigger("Trigger");
let timeOutPort = op.outValue("Event Time");

// vars
let lastListenerId;

// change listsners
timePort.onChange = handleChange;

// functions
function handleChange()
{
    let time = timePort.get();

    // check if time is valid
    if (!CABLES.WEBAUDIO.isValidToneTime(time))
    {
        op.uiAttr({ "error": "Time not valid, Example: \"0:1:0" });
        op.refreshParams();

        return;
    }
    else
    {
        op.uiAttr({ "error": null });
        op.refreshParams();
    }

    // clear old schedule
    if (lastListenerId)
    {
        Tone.Transport.clear(lastListenerId);
        lastListenerId = undefined;
    }
    // create new schedule
    let cb = function (time)
    {
        timeOutPort.set(time);
	    triggerPort.trigger();
    };

    lastListenerId = Tone.Transport.schedule(
        cb,
        time
    );
}

handleChange();
