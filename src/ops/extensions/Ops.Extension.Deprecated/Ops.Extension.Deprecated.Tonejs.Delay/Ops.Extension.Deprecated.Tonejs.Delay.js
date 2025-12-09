CABLES.WEBAUDIO.createAudioContext(op);

// default values
let DELAY_TIME_DEFAULT = 0.11;
let DELAY_TIME_MIN = 0;
let DELAY_TIME_MAX = 1;
let MAX_DELAY_TIME_DEFAULT = 179;
let MAX_DELAY_TIME_MIN = 1;
let MAX_DELAY_TIME_MAX = 179;

// vars
let node = new Tone.Delay(DELAY_TIME_DEFAULT, MAX_DELAY_TIME_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let delayTimePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Delay Time", node.delayTime, { "display": "range", "min": DELAY_TIME_MIN, "max": DELAY_TIME_MAX }, DELAY_TIME_DEFAULT);
let maxDelayTimePort = op.inValueString("Max Delay Time", MAX_DELAY_TIME_DEFAULT);
maxDelayTimePort.onChange = handleChange;

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// functions
function handleChange()
{
    let maxDelayTime = maxDelayTimePort.get();

    if (!maxDelayTime || maxDelayTime < MAX_DELAY_TIME_MIN || maxDelayTime > MAX_DELAY_TIME_MAX)
    {
        op.log("Warning: Max Delay Time should be between 1 and 179!");
        return;
    }

    // check if maxDelayTime is valid and set it if so
    try
    {
	    let time = new Tone.TimeBase(maxDelayTime);
	    node.set("maxDelay", maxDelayTime);
    }
    catch (e)
    {
        // not valid
        op.uiAttr({ "error": "maxDelayTime not valid, Examples: \"4n\", \"1m\", 2" });
        op.refreshParams();
    	return;
    }
    // reset UI warning
    op.uiAttr({ "error": null });
    op.refreshParams();
}

handleChange();
