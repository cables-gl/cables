
CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var PLAY_DEFAULT = true;
var LOOP_DEFAULT = true;
var DETUNE_DEFAULT = 0;
var DRIFT_DEFAULT = 0;
var PLAYBACK_RATE_DEFAULT = 1;
var PLAYBACK_RATE_MIN = 0.0001;
var PLAYBACK_RATE_MAX = 100;
var OVERLAP_DEFAULT = 0.1;
var GRAIN_SIZE_MIN = 0.0001;
var GRAIN_SIZE_DEFAULT = 0.2;
var PLAY_DEFAULT = true;
var LOOP_START_DEFAULT = 0;
var LOOP_END_DEFAULT = 0;

// vars
var node = new Tone.GrainPlayer();
node.set("loop", LOOP_DEFAULT);
var buffer = null;
var bufferLoaded = false;

// input ports
var playPort = op.addInPort( new CABLES.Port( this, "Play", CABLES.OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
playPort.set(PLAY_DEFAULT);
var samplePort = op.inObject("Sample (AudioBuffer)");
var detunePort = op.inValue("Detune", DETUNE_DEFAULT);
var driftPort = op.inValue("Drift", DRIFT_DEFAULT);
var playbackRatePort = op.inValue("Playback Rate", PLAYBACK_RATE_DEFAULT);
var overlapPort = op.inValue("Overlap", OVERLAP_DEFAULT);
var grainSizePort = op.inValue("Grain Size", GRAIN_SIZE_DEFAULT);
var loopPort = op.addInPort( new CABLES.Port( this, "Loop", CABLES.OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
loopPort.set(PLAY_DEFAULT);
var loopStartPort = op.inValue("Loop Start", LOOP_START_DEFAULT);
var loopEndPort = op.inValue("Loop End", LOOP_END_DEFAULT);

// change listeners
playPort.onChange = function() {
    var play = playPort.get();
    if(bufferLoaded) {
        if(play) {
            try {
                node.start();    
            } catch(e) {
                op.log("ERROR: ", e);
            }
        } else {
            try {
                node.stop();    
            } catch(e) {
                op.log("ERROR: ", e);
            }
        }
    }
};
detunePort.onChange = function(){ setNodeValue( "detune", detunePort.get() ); };
driftPort.onChange = function(){
    var drift = driftPort.get();
    if(drift < 0) {
        drift = 0;
    } 
    /*
    else if(drift > buffer.duration) {
        drift = buffer.duration - 0.00001;
    }
    */
    setNodeValue("drift", drift);    
};
playbackRatePort.onChange = function(){
    var playBackRate = playbackRatePort.get();
    var playBackRateF = parseFloat(playbackRatePort.get());
    if(!isNaN(playBackRateF)) {
        if(playBackRateF > 0) {
            setNodeValue("playbackRate", playBackRateF);
        } else {
            // TODO: Show error
        }
    } else if(typeof playBackRate === 'string') {
        if(CABLES.WEBAUDIO.isValidToneTime(playBackRate)) {
            setNodeValue("playbackRate", playBackRate);
        } else {
            // TODO: Show error
        }
    }
};
overlapPort.onChange = function() {
    var overlap = overlapPort.get();
    if(CABLES.WEBAUDIO.isValidToneTime(overlap)) {
        setNodeValue( "overlap", overlap );    
    } else {
        // TODO, show error
    }
};
loopPort.onChange = function(){ setNodeValue( "loop", loopPort.get() ); };
loopStartPort.onChange = function(){ 
    var t = loopStartPort.get();
    if(CABLES.WEBAUDIO.isValidToneTime(t)) {
        setNodeValue("loopStart", t);     
    }
};
loopEndPort.onChange = function(){
    var t = loopEndPort.get();
    if(CABLES.WEBAUDIO.isValidToneTime(t)) {
        setNodeValue("loopStart", t);     
    }
    
};
grainSizePort.onChange = function() {
    var grainSize = grainSizePort.get();
    var grainSizeF = parseFloat(grainSize);
    //var grainSizeF = parseFloat("okjl");
    if(!isNaN(grainSizeF)) {
        if(!grainSizeF || grainSizeF < 0.02) {
            grainSizePort.set(GRAIN_SIZE_MIN);
        } else {
            setNodeValue( "grainSize", grainSizeF );    
        }    
    } else if(isValidTime(grainSize)) {
        setNodeValue( "grainSize", grainSize );    
    }
};

samplePort.onChange = function() {
    var sample = samplePort.get();
    if(sample) { // TODO: Add better validity-check
        node.set("buffer", sample);
    	var play = playPort.get();
        if(play) {
            try {
                node.start();    
            } catch(e) {
                op.log("ERROR: ", e);
            }
        } else {
            try {
                node.stop();    
            } catch(e) {
                op.log("ERROR: ", e);
            }
        }
    	bufferLoaded = true;    
    }
};

// functions
function setNodeValue(key, val) {
    node.set(key, val);
}

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
