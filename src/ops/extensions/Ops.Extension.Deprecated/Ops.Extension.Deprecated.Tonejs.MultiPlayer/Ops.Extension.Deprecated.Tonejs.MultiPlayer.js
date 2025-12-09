op.name = "MultiPlayer";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
let N_BUFFERS = 8;
var TIME_DEFAULT = "+0";
let OFFSET_DEFAULT = "0";
let PITCH_DEFAULT = 0;
let PITCH_UI_MIN = -12;
let PITCH_UI_MAX = 12;
var TIME_DEFAULT = "+0";
let DURATION_DEFAULT;
let GAIN_DEFAULT = 1;
let LOOP_START_TIME_DEFAULT;
let LOOP_END_TIME_DEFAULT;
let FADE_IN_TIME_DEFAULT = "0";
let FADE_OUT_TIME_DEFAULT = "0";
let VOLUME_DEFAULT = 0;
let VOLUME_MIN = -96;
let VOLUME_MAX = 0;
let MUTE_DEFAULT = 0;

// vars
let node = new Tone.MultiPlayer();
let audioBufferPorts = [];

// default values

// functions
function createBufferInputs()
{
    for (let i = 0; i < N_BUFFERS; i++)
    {
        let port = op.inObject("AudioBuffer " + i);
        port.onChange = onChangeBufferPort.bind(port);
        port.data.index = i;
        audioBufferPorts.push(port);
    }
}

function onChangeBufferPort()
{
    if (this.get())
    {
        node.buffers.add(this.data.index, this.get());
    }
    else
    {
        // ignore??
    }
}

// checks if AudioBuffer-port i has an AudioBuffer attached
function indexIsValid(i)
{
    return i >= 0 && i < N_BUFFERS && audioBufferPorts[i].get();
}

// input ports
createBufferInputs();
let starPort = op.inTriggerButton("Start Buffer");
let indexPort = op.inValue("Buffer Index", 0);
let timePort = op.inValueString("Time", TIME_DEFAULT);
let fadeInPort = op.inValueString("Fade In Time", FADE_IN_TIME_DEFAULT);
let offsetPort = op.inValueString("Offset", OFFSET_DEFAULT);
let durationPort = op.inValueString("Duration");
let pitchPort = op.addInPort(new CABLES.Port(op, "Pitch", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": PITCH_UI_MIN, "max": PITCH_UI_MAX }, PITCH_DEFAULT));
let gainPort = op.inValueSlider("Gain", GAIN_DEFAULT);
let starLoopPort = op.inTriggerButton("Start Buffer (Loop)");
let loopStartTimePort = op.inValueString("Loop Start Time");
let loopEndTimePort = op.inValueString("Loop End Time");
let stopPort = op.inTriggerButton("Stop Buffer");
let stopAllPort = op.inTriggerButton("Stop All Buffers");
let fadeOutPort = op.inValueString("Fade Out Time", FADE_OUT_TIME_DEFAULT);
let volumePort = op.addInPort(new CABLES.Port(op, "Volume", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": VOLUME_MIN, "max": VOLUME_MAX }, VOLUME_DEFAULT));
let mutePort = op.inValueBool("Mute", MUTE_DEFAULT);

// change listeners
starPort.onTriggered = function ()
{
    let index = indexPort.get();
    if (indexIsValid(index))
    {
        let time = timePort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(time))
        {
            time = TIME_DEFAULT;
        }
        let offset = offsetPort.get();
        let duration = durationPort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(duration))
        {
            duration = DURATION_DEFAULT;
        }
        op.log("duration: ", duration);
        let pitch = pitchPort.get();
        let gain = gainPort.get();
        // Tone.js doc: start (bufferName, time[, offset][, duration][, pitch][, gain])
        try
        {
            node.start(audioBufferPorts[index].data.index, time, offset, duration, pitch, gain);
        }
        catch (e) { op.log(e); }
    }
    else
    {
        op.log("Warning: There is no buffer at index ", index);
    }
};

starLoopPort.onTriggered = function ()
{
    op.log("Loop");
    let index = indexPort.get();
    if (indexIsValid(index))
    {
        let time = timePort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(time))
        {
            time = TIME_DEFAULT;
        }
        let offset = offsetPort.get();
        let duration = durationPort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(duration))
        {
            duration = DURATION_DEFAULT;
        }
        let pitch = pitchPort.get();
        let gain = gainPort.get();
        let loopStartTime = loopStartTimePort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(loopStartTime))
        {
            loopStartTime = LOOP_START_TIME_DEFAULT;
        }
        let loopEndTime = loopEndTimePort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(loopEndTime))
        {
            loopEndTime = LOOP_END_TIME_DEFAULT;
        }
        // tone.js doc: .startLoop (bufferName, time[, offset][, loopStart][, loopEnd][, pitch][, gain])
        try
        {
            node.startLoop(audioBufferPorts[index].data.index, time, offset, loopStartTime, loopEndTime, duration, pitch, gain);
        }
        catch (e) { op.log(e); }
    }
    else
    {
        op.log("Warning: There is no buffer at index ", index);
    }
};

stopPort.onTriggered = function ()
{
    let index = indexPort.get();
    if (indexIsValid(index))
    {
        let time = timePort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(time))
        {
            time = TIME_DEFAULT;
        }
        try
        {
            node.stop(index, time);
        }
        catch (e) { op.log(e); }
    }
    else
    {
        op.log("Warning: The AudioBuffer to stop does not seem to exist, index:  ", index);
    }
};

stopAllPort.onTriggered = function ()
{
    let time = timePort.get();
    if (!CABLES.WEBAUDIO.isValidToneTime(time))
    {
        time = TIME_DEFAULT;
    }
    try
    {
        node.stopAll(time);
    }
    catch (e) { op.log(e); }
};

fadeInPort.onChange = function ()
{
    let fadeInTime = fadeInPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(fadeInTime))
    {
        node.set("fadeIn", fadeInTime);
    }
};

// not working all the time, tone.js-bug?
fadeOutPort.onChange = function ()
{
    let fadeOutTime = fadeOutPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(fadeOutTime))
    {
        node.set("fadeOut", fadeOutTime);
        op.log("fadeout time", fadeOutTime);
    }
};

volumePort.onChange = function ()
{
    let volume = volumePort.get();
    if (volume >= VOLUME_MIN && volume <= VOLUME_MAX)
    {
        node.set("volume", volume);
    }
};

mutePort.onChange = function ()
{
    let mute = !!mutePort.get();
    try
    {
        node.mute = mute;
    }
    catch (e)
    {
        op.log("Error: Could not mute MultiPlayer");
    }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
