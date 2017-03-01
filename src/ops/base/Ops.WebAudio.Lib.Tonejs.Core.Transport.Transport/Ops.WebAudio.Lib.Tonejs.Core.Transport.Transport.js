op.name="Transport";

CABLES.WebAudio.createAudioContext(op);

// in ports
var bpmPort = op.addInPort( new Port( this, "BPM", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 1, 'max': 300 } ));
var swingPort = op.addInPort( new Port( this, "Swing", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var swingSubdivisionPort = op.inValueString("Swing Subdivision");
var timeSignaturePort = op.inValue("Time Division");
var loopPort = op.addInPort( new Port( op, "Loop", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
var loopStartPort = op.inValueString("Loop Start");
var loopEndPort = op.inValueString("Loop End");
var ppqPort = op.inValue("Pulses Per Quarter Note");

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

// out ports

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

// change events
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
    } catch(e) {}
};

ppqPort.onChange = function() {
    try {
        Tone.Transport.set("ppq", ppqPort.get());
    } catch(e) {}
};



