op.name="Transport";

CABLES.WebAudio.createAudioContext(op);

// in port defaults
var BPM_DEFAULT = 120;
var BPM_MIN = 1;
var BPM_MAX = 2000;
var SWING_DEFAULT = 0;
var SWING_SUBDIVISION_DEFAULT = "8n";
var TIME_SIGNATURE_DEFAULT = 4;
var LOOP_DEFAULT = true;
var LOOP_START_DEFAULT = 0;
var LOOP_END_DEFAULT = "4m";
var PPQ_DEFAULT = 192;
var START_TIME_DEFAULT = "+0";
var START_OFFSET_DEFAULT = "0";
var AUTO_START_DEFAULT = true;
var STOP_TIME_DEFAULT = "+0";

// in ports
var updatePort = op.inFunction("Update");
var bpmPort = op.addInPort( new Port( this, "BPM", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 1, 'max': 300 } ));
var swingPort = op.addInPort( new Port( this, "Swing", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var swingSubdivisionPort = op.inValueString("Swing Subdivision");
var timeSignaturePort = op.inValue("Time Division");
var loopPort = op.addInPort( new Port( op, "Loop", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
var loopStartPort = op.inValueString("Loop Start");
var loopEndPort = op.inValueString("Loop End");
var ppqPort = op.inValue("Pulses Per Quarter Note");
var startPort = op.addInPort( new Port( this, "Start", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var startOffsetPort = op.inValueString("Start Offset", START_OFFSET_DEFAULT);
var autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
var stopPort = op.addInPort( new Port( this, "Stop", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);

// out ports
var statePort = op.outValue("State");
var positionPort = op.outValue("Position (BarsBeatsSixteenth)");
var secondsPort = op.outValue("Seconds");
var progressPort = op.outValue("Progress");
var ticksPort = op.outValue("Ticks");

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
function checkAutoStart() {
    if(autoStartPort.get() && Tone.Transport.get("state") !== "started") {
        Tone.Transport.start();
    }
}

function startTransport() {
    var startTime = startTimePort.get();
    var startOffset = startOffsetPort.get();
    if(startTime) {
        if(startOffset) {
            Tone.Transport.start(startTime, startOffset);
        } else {
            Tone.Transport.start(startTime);
        }
    } else {
        Tone.Transport.start();
    }
    //op.log("Transport started with time: ", startTime);
}

function stopTransport() {
    var stopTime = stopTimePort.get();
    if(stopTime) {
        Tone.Transport.stop(stopTime);
    } else {
        Tone.Transport.stop();
    }
}

// change events
updatePort.onTriggered = function() {
    statePort.set(Tone.Transport.state);
    positionPort.set(Tone.Transport.position);
    secondsPort.set(Tone.Transport.seconds);
    progressPort.set(Tone.Transport.progress);
    ticksPort.set(Tone.Transport.ticks);
};
updatePort.onLinkChanged = function() {
    checkAutoStart();
};
bpmPort.onChange = function() {
    var bpm = bpmPort.get();
    if(bpm && bpm >= BPM_MIN && bpm <= BPM_MAX) {
        Tone.Transport.set("bpm", bpmPort.get());        
    }
};

swingPort.onChange = function() {
    try {
        Tone.Transport.set("swing", swingPort.get());    
    } catch(e) {}
};

swingSubdivisionPort.onChange = function() {
    try {
        Tone.Transport.set("swingSubdivision", swingSubdivisionPort.get());
    } catch(e) {}
};

timeSignaturePort.onChange = function() {
    try {
        Tone.Transport.set("timeSignature", timeSignaturePort.get());
    } catch(e) {}
};

loopPort.onChange = function() {
    op.log("Loop set to: ", loopPort.get());
    if(loopPort.get()) {
        Tone.Transport.set("loop", true);
    } else {
        Tone.Transport.set("loop", false);
    }
};

loopStartPort.onChange = function() {
    try {
        Tone.Transport.set("loopStart", loopStartPort.get() || 0);
    } catch(e) {}
};

loopEndPort.onChange = function() {
    try {
        Tone.Transport.set("loopEnd", loopEndPort.get() || 0);
    } catch(e) { op.log(e); }
};

ppqPort.onChange = function() {
    try {
        Tone.Transport.set("ppq", ppqPort.get());
    } catch(e) {}
};
startPort.onTriggered = startTransport;
stopPort.onTriggered = stopTransport;
autoStartPort.onChange = function() {
    if(autoStartPort.get() && Tone.Transport.get("state") !== "started") {
        startTransport();
    }
};

// initialiation when all ports are set
op.onLoaded = function() {
    checkAutoStart();
};


