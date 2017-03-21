op.name="GrainPlayer";

CABLES.WebAudio.createAudioContext(op);

// defaults
var PLAY_DEFAULT = true;
var LOOP_DEFAULT = true;
var DETUNE_DEFAULT = 0;
var DRIFT_DEFAULT = 0;
var PLAYBACK_RATE_DEFAULT = 1;
var PLAYBACK_RATE_MIN = 0.0001;
var PLAYBACK_RATE_MAX = 100;
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
var playPort = op.addInPort( new Port( this, "Play", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
playPort.set(PLAY_DEFAULT);
var sampleUrlPort = op.addInPort( new Port( this, "Sample", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: 'audio'  } ));
var detunePort = op.inValue("Detune", DETUNE_DEFAULT);
var driftPort = op.inValue("Drift", DRIFT_DEFAULT);
var playbackRatePort = op.inValue("Playback Rate", PLAYBACK_RATE_DEFAULT);
var grainSizePort = op.inValue("Grain Size", GRAIN_SIZE_DEFAULT);
var loopPort = op.addInPort( new Port( this, "Loop", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
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
    op.log(drift);
    if(drift < 0) {
        drift = 0;
        driftPort.set(drift);
    } else if(drift < buffer.duration) {
        drift = buffer.duration - 0.00001;
        driftPort.set(drift);
    }
    setNodeValue("drift", driftPort.get());    
};
playbackRatePort.onChange = function(){
    var playBackRate = playbackRatePort.get();
    var playBackRateF = parseFloat(playbackRatePort.get());
    if(!isNaN(playBackRateF)) {
        if(playBackRateF > 0) {
            setNodeValue("playbackRate", playBackRateF);
        } else {
            playbackRatePort.set(PLAYBACK_RATE_MIN);
        }
    } else if(typeof playBackRate === 'string') {
        op.log("playbackrate: ", playBackRate);
        if(isValidTime(playBackRate)) {
            op.log("... is valid time");
            setNodeValue("playbackRate", playBackRate);
        } else {
            // do nothing?
        }
    }
};
loopPort.onChange = function(){ setNodeValue( "loop", loopPort.get() ); };
loopStartPort.onChange = function(){ 
    var t = loopStartPort.get();
    if(isValidTime(t)) {
        setNodeValue("loopStart", t);     
    }
};
loopEndPort.onChange = function(){
    var t = loopEndPort.get();
    if(isValidTime(t)) {
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

sampleUrlPort.onChange = function() {
    var sampleUrl = sampleUrlPort.get();
    if(sampleUrl) {
        sampleUrl = sampleUrl.trim();
    }
    if(sampleUrl) {
        bufferLoaded = false;
        buffer = new Tone.Buffer (sampleUrl, sampleLoaded, function(e){
        	op.log("Could not load sample!", e);
        });    
    }
};

// functions
function sampleLoaded() {
    console.log("sample loaded");
	node.set("buffer", buffer.get());
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
	op.log("buffer duration:", buffer.duration);
}

function isValidTime(t) {
    try{
	    var time = new Tone.TimeBase(t);	
    } catch(e) {
    	return false;
    }
    return true;
}

function setNodeValue(key, val) {
    node.set(key, val);
}

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);
