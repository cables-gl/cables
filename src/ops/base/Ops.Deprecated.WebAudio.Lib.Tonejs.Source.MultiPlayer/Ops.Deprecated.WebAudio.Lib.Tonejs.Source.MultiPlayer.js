op.name="MultiPlayer";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
var N_BUFFERS = 8;
var TIME_DEFAULT = "+0";
var OFFSET_DEFAULT = "0";
var PITCH_DEFAULT = 0;
var PITCH_UI_MIN = -12;
var PITCH_UI_MAX = 12;
var TIME_DEFAULT = "+0";
var DURATION_DEFAULT = undefined;
var GAIN_DEFAULT = 1;
var LOOP_START_TIME_DEFAULT = undefined;
var LOOP_END_TIME_DEFAULT = undefined;
var FADE_IN_TIME_DEFAULT = "0";
var FADE_OUT_TIME_DEFAULT = "0";
var VOLUME_DEFAULT = 0;
var VOLUME_MIN = -96;
var VOLUME_MAX = 0;
var MUTE_DEFAULT = 0;

// vars
var node = new Tone.MultiPlayer();
var audioBufferPorts = [];

// default values

// functions
function createBufferInputs() {
    for(var i=0; i<N_BUFFERS; i++) {
        var port = op.inObject("AudioBuffer " + i);
        port.onChange = onChangeBufferPort.bind(port);
        port.data.index = i;
        audioBufferPorts.push(port);
    }
}

function onChangeBufferPort() {
    if(this.get()) {
        node.buffers.add(this.data.index, this.get());
    } else {
        // ignore??
    }
}

// checks if AudioBuffer-port i has an AudioBuffer attached
function indexIsValid(i) {
    return i >= 0 && i < N_BUFFERS && audioBufferPorts[i].get();
}

// input ports
createBufferInputs();
var starPort = op.inFunctionButton("Start Buffer");
var indexPort = op.inValue("Buffer Index", 0);
var timePort = op.inValueString("Time", TIME_DEFAULT);
var fadeInPort = op.inValueString("Fade In Time", FADE_IN_TIME_DEFAULT);
var offsetPort = op.inValueString("Offset", OFFSET_DEFAULT);
var durationPort = op.inValueString("Duration");
var pitchPort = op.addInPort( new Port( op, "Pitch", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PITCH_UI_MIN, 'max': PITCH_UI_MAX }, PITCH_DEFAULT ));
var gainPort = op.inValueSlider("Gain", GAIN_DEFAULT);
var starLoopPort = op.inFunctionButton("Start Buffer (Loop)");
var loopStartTimePort = op.inValueString("Loop Start Time");
var loopEndTimePort = op.inValueString("Loop End Time");
var stopPort = op.inFunctionButton("Stop Buffer");
var stopAllPort = op.inFunctionButton("Stop All Buffers");
var fadeOutPort = op.inValueString("Fade Out Time", FADE_OUT_TIME_DEFAULT);
var volumePort = op.addInPort( new Port( op, "Volume", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX }, VOLUME_DEFAULT ));
var mutePort = op.inValueBool("Mute", MUTE_DEFAULT);

// change listeners
starPort.onTriggered = function() {
    var index = indexPort.get();
    if(indexIsValid(index)) {
        var time = timePort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(time)) {
            time = TIME_DEFAULT;
        }
        var offset = offsetPort.get();
        var duration = durationPort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(duration)) {
            duration = DURATION_DEFAULT;
        }
        op.log("duration: ", duration);
        var pitch = pitchPort.get();
        var gain = gainPort.get();
        //Tone.js doc: start (bufferName, time[, offset][, duration][, pitch][, gain])
        try {
            node.start(audioBufferPorts[index].data.index, time, offset, duration, pitch, gain);    
        } catch(e) { op.log(e); }
    } else {
        op.log("Warning: There is no buffer at index ", index);
    }
};

starLoopPort.onTriggered = function() {
    op.log("Loop");
    var index = indexPort.get();
    if(indexIsValid(index)) {
        var time = timePort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(time)) {
            time = TIME_DEFAULT;
        }
        var offset = offsetPort.get();
        var duration = durationPort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(duration)) {
            duration = DURATION_DEFAULT;
        }
        var pitch = pitchPort.get();
        var gain = gainPort.get();
        var loopStartTime = loopStartTimePort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(loopStartTime)) {
            loopStartTime = LOOP_START_TIME_DEFAULT;
        }
        var loopEndTime = loopEndTimePort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(loopEndTime)) {
            loopEndTime = LOOP_END_TIME_DEFAULT;
        }
        // tone.js doc: .startLoop (bufferName, time[, offset][, loopStart][, loopEnd][, pitch][, gain])
        try {
            node.startLoop(audioBufferPorts[index].data.index, time, offset, loopStartTime, loopEndTime, duration, pitch, gain);    
        } catch(e) { op.log(e); }
    } else {
        op.log("Warning: There is no buffer at index ", index);
    }
};

stopPort.onTriggered = function() {
    var index = indexPort.get();
    if(indexIsValid(index)) {
        var time = timePort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(time)) {
            time = TIME_DEFAULT;
        }
        try {
            node.stop(index, time);    
        } catch(e) { op.log(e); }
    } else {
        op.log("Warning: The AudioBuffer to stop does not seem to exist, index:  ", index);
    }
};

stopAllPort.onTriggered = function() {
    var time = timePort.get();
    if(!CABLES.WEBAUDIO.isValidToneTime(time)) {
        time = TIME_DEFAULT;
    }
    try {
        node.stopAll(time);
    } catch(e) { op.log(e); }   
};

fadeInPort.onChange = function() {
    var fadeInTime = fadeInPort.get();
    if(CABLES.WEBAUDIO.isValidToneTime(fadeInTime)) {
        node.set("fadeIn", fadeInTime);
    }
};

// not working all the time, tone.js-bug?
fadeOutPort.onChange = function() {
    var fadeOutTime = fadeOutPort.get();
    if(CABLES.WEBAUDIO.isValidToneTime(fadeOutTime)) {
        node.set("fadeOut", fadeOutTime);
        op.log("fadeout time", fadeOutTime);
    }
};

volumePort.onChange = function() {
    var volume = volumePort.get();
    if(volume >= VOLUME_MIN && volume <= VOLUME_MAX) {
        node.set("volume", volume);    
    }
};

mutePort.onChange = function() {
    var mute = mutePort.get() ? true : false;
    try {
        node.mute = mute;    
    } catch(e) {
        op.log("Error: Could not mute MultiPlayer");
    }
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);