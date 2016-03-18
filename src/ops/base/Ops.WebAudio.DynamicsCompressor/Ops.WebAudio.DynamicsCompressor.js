this.name="Ops.WebAudio.DynamicsCompressor";

if(!window.audioContext)
    if('webkitAudioContext' in window) audioContext = new webkitAudioContext();
        else audioContext = new AudioContext();

// In Ports
var audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));

// Constants - see http://webaudio.github.io/web-audio-api/#idl-def-DynamicsCompressorNode
var ATTACK_MIN = 0.0;
var ATTACK_MAX = 1.0;
var ATTACK_DEF = 0.003;
var KNEE_MIN = 0;
var KNEE_MAX = 40;
var KNEE_DEF = 30;
var RATIO_MIN = 1;
var RATIO_MAX = 20;
var RATIO_DEF = 12;
var RELEASE_MIN = 0.0;
var RELEASE_MAX = 1.0;
var RELEASE_DEF = 0.250;
var THRESHOLD_MIN = -100;
var THRESHOLD_MAX = 0;
var THRESHOLD_DEF = -24;

var threshold=this.addInPort(new Port(this,"threshold",OP_PORT_TYPE_VALUE, {"display": "range", "min": THRESHOLD_MIN, "max": THRESHOLD_MAX}));
var knee=this.addInPort(new Port(this,"knee",OP_PORT_TYPE_VALUE, {"display": "range", "min": KNEE_MIN, "max": KNEE_MAX}));
var ratio=this.addInPort(new Port(this,"ratio",OP_PORT_TYPE_VALUE, {"display": "range", "min": RATIO_MIN, "max": RATIO_MAX}));
var attack=this.addInPort(new Port(this,"attack",OP_PORT_TYPE_VALUE, {"display": "range", "min": ATTACK_MIN, "max": ATTACK_MAX}));
var release=this.addInPort(new Port(this,"release",OP_PORT_TYPE_VALUE, {"display": "range", "min": RELEASE_MIN, "max": RELEASE_MAX}));

this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

// Out Ports
var audioOut=this.addOutPort(new Port(this,"audio out",OP_PORT_TYPE_OBJECT));
var reduction=this.addOutPort(new Port(this,"reduction",OP_PORT_TYPE_VALUE));

// Reference needed to disconnect
var oldAudioIn = null;

var compressor = audioContext.createDynamicsCompressor();

// Audio In Value Change
audioIn.onValueChange( function() {
    if (!audioIn.get()) {
        if (oldAudioIn !== null) {
            try {
                oldAudioIn.disconnect(compressor);
            } catch(e) { console.log(e); }
        }
    }
    else
    {
        audioIn.val.connect(compressor);
    }
    oldAudioIn=audioIn.val;
});

// exe – only needed, to update the reduction value (useful for debugging and make-up gain ops)
this.exe.onTriggered=function()
{
    if(compressor) reduction.set( compressor.reduction.value );
};

function checkBounds(value, min, max) {
    if(value < min) return min;
    if(value > max) return max;
    return value;
}

// Value Change Callbacks

attack.onValueChange( function() {
    compressor.attack.value = checkBounds( parseFloat( attack.get(), ATTACK_MIN, ATTACK_MAX) );
    attack.set( compressor.attack.value ); // update UI with clamped value
});

knee.onValueChange( function() {
    compressor.knee.value = checkBounds( parseFloat( knee.get() ), KNEE_MIN, KNEE_MAX );
    knee.set( compressor.knee.value ); // update UI with clamped value
});

ratio.onValueChange( function() {
    compressor.ratio.value = checkBounds( parseFloat( ratio.get() ), RATIO_MIN, RATIO_MAX );
    ratio.set( compressor.ratio.value ); // update UI with clamped value
});

release.onValueChange( function() {
    compressor.release.value = checkBounds( parseFloat( release.get() ), RELEASE_MIN, RELEASE_MAX );
    release.set( compressor.release.value ); // update UI with clamped value
});

threshold.onValueChange( function() {
    compressor.threshold.value = checkBounds( parseFloat( threshold.get() ), THRESHOLD_MIN, THRESHOLD_MAX );
    threshold.set( compressor.threshold.value ); // update UI with clamped value
});

// Init In-Port Values
attack.set(ATTACK_DEF);
knee.set(KNEE_DEF);
ratio.set(RATIO_DEF);
release.set(RELEASE_DEF);
threshold.set(THRESHOLD_DEF);

// Set Out Port
audioOut.set( compressor );
