op.name="Transport";

CABLES.WebAudio.createAudioContext(op);
Tone.setContext(window.audioContext);

// in ports
var bpmPort = op.addInPort( new Port( this, "BPM", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 1, 'max': 300 } ));
var swingPort = op.addInPort( new Port( this, "Swing", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var swingSubdivisionPort = op.inValueString("Swing Subdivision");
var timeSignaturePort = op.inValue("Time Division");
var loopStartPort = op.inValueString("Loop Start");
var loopEndPort = op.inValueString("Loop End");
var ppqPort = op.inValue("Pulses Per Quarter Note");

// in port defaults
var BPM_DEFAULT = 120;
var SWING_DEFAULT = 0;
var SWING_SUBDIVISION_DEFAULT = "8n";
var TIME_SIGNATURE_DEFAULT = 4;
var LOOP_START_DEFAULT = 0;
var LOOP_END_DEFAULT = "4m";
var PPQ_DEFAULT = 192;

// out ports

// set in port defaults
bpmPort.set(BPM_DEFAULT);
swingPort.set(SWING_DEFAULT);
swingSubdivisionPort.set(SWING_SUBDIVISION_DEFAULT);
timeSignaturePort.set(TIME_SIGNATURE_DEFAULT);
loopStartPort.set(LOOP_START_DEFAULT);
loopEndPort.set(LOOP_END_DEFAULT);
ppqPort.set(PPQ_DEFAULT);

// change events

bpmPort.onChange = function() {
    Tone.Transport.set("bpm", bpmPort.get());    
};

swingPort.onChange = function() {
    Tone.Transport.set("swing", swingPort.get());    
};

swingSubdivisionPort.onChange = function() {
    Tone.Transport.set("swingSubdivision", swingSubdivisionPort.get());
};

timeSignaturePort.onChange = function() {
    Tone.Transport.set("timeSignature", timeSignature.get());
};

loopStartPort.onChange = function() {
    Tone.Transport.set("loopStart", loopStart.get());
};

loopEndPort.onChange = function() {
    Tone.Transport.set("loopEnd", loopEnd.get());
};

ppqPort.onChange = function() {
    Tone.Transport.set("ppq", ppqPort.get());
};



