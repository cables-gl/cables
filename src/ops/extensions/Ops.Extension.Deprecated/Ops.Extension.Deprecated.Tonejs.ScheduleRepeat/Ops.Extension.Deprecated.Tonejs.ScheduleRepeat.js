CABLES.WEBAUDIO.createAudioContext(op);

let INFINITE = "Infinite";
let START_TIME_DEFAULT = "0";

// input ports
let intervalPort = op.inValueString("Interval", "4n");
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let durationPort = op.inValueString("Duration", INFINITE);

// output ports
let triggerPort = op.outTrigger("Trigger");
let timeOutPort = op.outValue("Event Time");

// vars
let lastListenerId;

// change listsners
intervalPort.onChange = handleChange;
startTimePort.onChange = handleChange;
durationPort.onChange = handleChange;

// functions
function handleChange()
{
    let duration = durationPort.get();
    let interval = intervalPort.get();
    let startTime = startTimePort.get();

    if (!interval || interval == 0)
    {
        op.log("Warning: Interval should not be 0!");
        return;
    }

    // check if interval is valid
    try
    {
        let time = new Tone.TimeBase(interval);
    }
    catch (e)
    {
        // interval not valid
        op.uiAttr({ "error": "Interval not valid, Examples: \"4n\", \"1m\", 2" });
        op.refreshParams();
        return;
    }
    // reset UI warning
    op.uiAttr({ "error": null });
    op.refreshParams();

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
    op.log("Creating new interval with interval: " + interval);
    if (isValidTime(startTime))
    {
        if (duration && duration !== INFINITE)
        {
            lastListenerId = Tone.Transport.scheduleRepeat(
                cb,
                interval,
                startTime
            );
        }
        else
        {
            lastListenerId = Tone.Transport.scheduleRepeat(
                cb,
                interval,
                startTime
            );
        }
    }
    else
    {
        lastListenerId = Tone.Transport.scheduleRepeat(
            cb,
            interval
        );
    }
}

handleChange();

// functions
function isValidTime(time)
{
    try
    {
        new Tone.TimeBase(time);
        return true;
    }
    catch (e)
    {
        return false;
    }
}
