CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var PLAY_DEFAULT = true;
let LOOP_DEFAULT = true;
let DETUNE_DEFAULT = 0;
let DRIFT_DEFAULT = 0;
let PLAYBACK_RATE_DEFAULT = 1;
let PLAYBACK_RATE_MIN = 0.0001;
let PLAYBACK_RATE_MAX = 100;
let OVERLAP_DEFAULT = 0.1;
let GRAIN_SIZE_MIN = 0.0001;
let GRAIN_SIZE_DEFAULT = 0.2;
var PLAY_DEFAULT = true;
let LOOP_START_DEFAULT = 0;
let LOOP_END_DEFAULT = 0;

// vars
let node = new Tone.GrainPlayer();
node.set("loop", LOOP_DEFAULT);
let buffer = null;
let bufferLoaded = false;

// input ports
let playPort = op.addInPort(new CABLES.Port(this, "Play", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
playPort.set(PLAY_DEFAULT);
let samplePort = op.inObject("Sample (AudioBuffer)");
let detunePort = op.inValue("Detune", DETUNE_DEFAULT);
let driftPort = op.inValue("Drift", DRIFT_DEFAULT);
let playbackRatePort = op.inValue("Playback Rate", PLAYBACK_RATE_DEFAULT);
let overlapPort = op.inValue("Overlap", OVERLAP_DEFAULT);
let grainSizePort = op.inValue("Grain Size", GRAIN_SIZE_DEFAULT);
let loopPort = op.addInPort(new CABLES.Port(this, "Loop", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
loopPort.set(PLAY_DEFAULT);
let loopStartPort = op.inValue("Loop Start", LOOP_START_DEFAULT);
let loopEndPort = op.inValue("Loop End", LOOP_END_DEFAULT);

// change listeners
playPort.onChange = function ()
{
    let play = playPort.get();
    if (bufferLoaded)
    {
        if (play)
        {
            try
            {
                node.start();
            }
            catch (e)
            {
                op.log("ERROR: ", e);
            }
        }
        else
        {
            try
            {
                node.stop();
            }
            catch (e)
            {
                op.log("ERROR: ", e);
            }
        }
    }
};
detunePort.onChange = function () { setNodeValue("detune", detunePort.get()); };
driftPort.onChange = function ()
{
    let drift = driftPort.get();
    if (drift < 0)
    {
        drift = 0;
    }
    /*
    else if(drift > buffer.duration) {
        drift = buffer.duration - 0.00001;
    }
    */
    setNodeValue("drift", drift);
};
playbackRatePort.onChange = function ()
{
    let playBackRate = playbackRatePort.get();
    let playBackRateF = parseFloat(playbackRatePort.get());
    if (!isNaN(playBackRateF))
    {
        if (playBackRateF > 0)
        {
            setNodeValue("playbackRate", playBackRateF);
        }
        else
        {
            // TODO: Show error
        }
    }
    else if (typeof playBackRate === "string")
    {
        if (CABLES.WEBAUDIO.isValidToneTime(playBackRate))
        {
            setNodeValue("playbackRate", playBackRate);
        }
        else
        {
            // TODO: Show error
        }
    }
};
overlapPort.onChange = function ()
{
    let overlap = overlapPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(overlap))
    {
        setNodeValue("overlap", overlap);
    }
    else
    {
        // TODO, show error
    }
};
loopPort.onChange = function () { setNodeValue("loop", loopPort.get()); };
loopStartPort.onChange = function ()
{
    let t = loopStartPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(t))
    {
        setNodeValue("loopStart", t);
    }
};
loopEndPort.onChange = function ()
{
    let t = loopEndPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(t))
    {
        setNodeValue("loopStart", t);
    }
};
grainSizePort.onChange = function ()
{
    let grainSize = grainSizePort.get();
    let grainSizeF = parseFloat(grainSize);
    // var grainSizeF = parseFloat("okjl");
    if (!isNaN(grainSizeF))
    {
        if (!grainSizeF || grainSizeF < 0.02)
        {
            grainSizePort.set(GRAIN_SIZE_MIN);
        }
        else
        {
            setNodeValue("grainSize", grainSizeF);
        }
    }
    else if (isValidTime(grainSize))
    {
        setNodeValue("grainSize", grainSize);
    }
};

samplePort.onChange = function ()
{
    let sample = samplePort.get();
    if (sample)
    { // TODO: Add better validity-check
        node.set("buffer", sample);
    	let play = playPort.get();
        if (play)
        {
            try
            {
                node.start();
            }
            catch (e)
            {
                op.log("ERROR: ", e);
            }
        }
        else
        {
            try
            {
                node.stop();
            }
            catch (e)
            {
                op.log("ERROR: ", e);
            }
        }
    	bufferLoaded = true;
    }
};

// functions
function setNodeValue(key, val)
{
    node.set(key, val);
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
