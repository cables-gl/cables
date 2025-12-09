CABLES.WEBAUDIO.createAudioContext(op);

// in port defaults
let BPM_DEFAULT = 120;
let BPM_MIN = 1;
let BPM_MAX = 2000;
let SWING_DEFAULT = 0;
let SWING_SUBDIVISION_DEFAULT = "8n";
let TIME_SIGNATURE_DEFAULT = 4;
let LOOP_DEFAULT = true;
let LOOP_START_DEFAULT = 0;
let LOOP_END_DEFAULT = "4m";
let PPQ_DEFAULT = 192;
let START_TIME_DEFAULT = "+0";
let START_OFFSET_DEFAULT = "0";
let AUTO_START_DEFAULT = true;
let STOP_TIME_DEFAULT = "+0";

// in ports
let updatePort = op.inTrigger("Update");
let bpmPort = op.addInPort(new CABLES.Port(this, "BPM", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": 1, "max": 300 }));
let swingPort = op.addInPort(new CABLES.Port(this, "Swing", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": 0, "max": 1 }));
let swingSubdivisionPort = op.inValueString("Swing Subdivision");
let timeSignaturePort = op.inValue("Time Division");
let loopPort = op.addInPort(new CABLES.Port(op, "Loop", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
let loopStartPort = op.inValueString("Loop Start");
let loopEndPort = op.inValueString("Loop End");
let ppqPort = op.inValue("Pulses Per Quarter Note");
let startPort = op.addInPort(new CABLES.Port(this, "Start", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let startOffsetPort = op.inValueString("Start Offset", START_OFFSET_DEFAULT);
let autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
let stopPort = op.addInPort(new CABLES.Port(this, "Stop", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);

// out ports
let statePort = op.outValue("State");
let positionPort = op.outValue("Position (BarsBeatsSixteenth)");
let secondsPort = op.outValue("Seconds");
let progressPort = op.outValue("Progress");
let ticksPort = op.outValue("Ticks");

// set in port defaults
bpmPort.set(BPM_DEFAULT);
swingPort.set(SWING_DEFAULT);
swingSubdivisionPort.set(SWING_SUBDIVISION_DEFAULT);
timeSignaturePort.set(TIME_SIGNATURE_DEFAULT);
loopPort.set(LOOP_DEFAULT);
loopStartPort.set(LOOP_START_DEFAULT);
loopEndPort.set(LOOP_END_DEFAULT);
ppqPort.set(PPQ_DEFAULT);

// set defaults
Tone.Transport.set("bpm", BPM_DEFAULT);
Tone.Transport.set("swing", SWING_DEFAULT);
Tone.Transport.set("swingSubdivision", SWING_SUBDIVISION_DEFAULT);
Tone.Transport.set("timeSignature", TIME_SIGNATURE_DEFAULT);
Tone.Transport.set("loop", LOOP_DEFAULT);
Tone.Transport.set("loopStart", LOOP_START_DEFAULT);
Tone.Transport.set("loopEnd", LOOP_END_DEFAULT);
Tone.Transport.set("ppq", PPQ_DEFAULT);

// functions
function checkAutoStart()
{
    if (autoStartPort.get() && Tone.Transport.get("state") !== "started")
    {
        Tone.Transport.start();
    }
}

function startTransport()
{
    let startTime = startTimePort.get();
    let startOffset = startOffsetPort.get();
    if (startTime)
    {
        if (startOffset)
        {
            Tone.Transport.start(startTime, startOffset);
        }
        else
        {
            Tone.Transport.start(startTime);
        }
    }
    else
    {
        Tone.Transport.start();
    }
    // op.log("Transport started with time: ", startTime);
}

function stopTransport()
{
    let stopTime = stopTimePort.get();
    if (stopTime)
    {
        Tone.Transport.stop(stopTime);
    }
    else
    {
        Tone.Transport.stop();
    }
}

// change events
updatePort.onTriggered = function ()
{
    statePort.set(Tone.Transport.state);
    positionPort.set(Tone.Transport.position);
    secondsPort.set(Tone.Transport.seconds);
    progressPort.set(Tone.Transport.progress);
    ticksPort.set(Tone.Transport.ticks);
};
updatePort.onLinkChanged = function ()
{
    checkAutoStart();
};
bpmPort.onChange = function ()
{
    let bpm = bpmPort.get();
    if (bpm && bpm >= BPM_MIN && bpm <= BPM_MAX)
    {
        Tone.Transport.set("bpm", bpmPort.get());
    }
};

swingPort.onChange = function ()
{
    try
    {
        Tone.Transport.set("swing", swingPort.get());
    }
    catch (e) {}
};

swingSubdivisionPort.onChange = function ()
{
    try
    {
        Tone.Transport.set("swingSubdivision", swingSubdivisionPort.get());
    }
    catch (e) {}
};

timeSignaturePort.onChange = function ()
{
    try
    {
        Tone.Transport.set("timeSignature", timeSignaturePort.get());
    }
    catch (e) {}
};

loopPort.onChange = function ()
{
    op.log("Loop set to: ", loopPort.get());
    if (loopPort.get())
    {
        Tone.Transport.set("loop", true);
    }
    else
    {
        Tone.Transport.set("loop", false);
    }
};

loopStartPort.onChange = function ()
{
    try
    {
        Tone.Transport.set("loopStart", loopStartPort.get() || 0);
    }
    catch (e) {}
};

loopEndPort.onChange = function ()
{
    try
    {
        Tone.Transport.set("loopEnd", loopEndPort.get() || 0);
    }
    catch (e) { op.log(e); }
};

ppqPort.onChange = function ()
{
    try
    {
        Tone.Transport.set("ppq", ppqPort.get());
    }
    catch (e) {}
};
startPort.onTriggered = startTransport;
stopPort.onTriggered = stopTransport;
autoStartPort.onChange = function ()
{
    if (autoStartPort.get() && Tone.Transport.get("state") !== "started")
    {
        startTransport();
    }
};

// initialiation when all ports are set
op.onLoaded = function ()
{
    checkAutoStart();
};
