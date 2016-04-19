this.name="Ops.WebAudio.BiquadFilter";

if(!window.audioContext){ audioContext = new AudioContext(); }

var Q_MIN = 0.0001;
var Q_MAX = 1000;
var Q_DEF = 1;
var Q_RESTRICT = true;
var DETUNE_MIN = -3600;
var DETUNE_MAX = 3600;
var DETUNE_DEF = 0;
var DETUNE_RESTRICT = false;
var FREQUENCY_MIN = 10;
var FREQUENCY_MAX = audioContext.sampleRate / 2; // Nyquist frequency.
var FREQUENCY_DEF = 350;
var GAIN_MIN = -40;
var GAIN_MAX = 40;
var GAIN_DEF = 0;
var TYPE_DEF = "allpass";

var audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));

var type = this.addInPort(new Port(this,"type",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['allpass','lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch']}));
var frequency = this.addInPort(new Port(this, "frequency", OP_PORT_TYPE_VALUE, {"display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX}));
var detune = this.addInPort(new Port(this, "detune", OP_PORT_TYPE_VALUE, {"display": "range", "min": DETUNE_MIN, "max": DETUNE_MAX}));
var q = this.addInPort(new Port(this, "q", OP_PORT_TYPE_VALUE, {"display": "range", "min": Q_MIN, "max": Q_MAX}));
var gain = this.addInPort(new Port(this, "gain", OP_PORT_TYPE_VALUE, {"display": "range", "min": GAIN_MIN, "max": GAIN_MAX}));

var biquadFilter = audioContext.createBiquadFilter();

var updateType = function(){
    biquadFilter.type = type.get();
};

var updateFrequency = function(){
    biquadFilter.frequency.value = frequency.get();
};

var updateDetune = function(){
    biquadFilter.detune.value = detune.get();
};

var updateQ = function(){
    biquadFilter.Q.value = q.get();
}

var updateGain = function(){
    biquadFilter.gain.value = gain.get();
}

type.onValueChange( updateType );
frequency.onValueChange(updateFrequency);
detune.onValueChange(updateDetune);
q.onValueChange(updateQ);
gain.onValueChange(updateGain);

var audioOut=this.addOutPort(new Port(this,"audio out",OP_PORT_TYPE_OBJECT));

var oldAudioIn = null;

audioIn.onValueChanged = function() {
    if (!audioIn.get()) {
        if (oldAudioIn !== null) {
            try{
                oldAudioIn.disconnect(biquadFilter);
            } catch(e) {
                console.log(e);
            }
        }
    } else {
        audioIn.val.connect(biquadFilter);
    }
    oldAudioIn=audioIn.val;
};

type.set(TYPE_DEF);
frequency.set( FREQUENCY_DEF );
detune.set( DETUNE_DEF );
q.set( Q_DEF );
gain.set( GAIN_DEF );

audioOut.set(biquadFilter);

/*

                    attribute BiquadFilterType type;
    readonly        attribute AudioParam       frequency;
    readonly        attribute AudioParam       detune;
    readonly        attribute AudioParam       Q;
    readonly        attribute AudioParam       gain;
    void getFrequencyResponse (Float32Array frequencyHz, Float32Array magResponse, Float32Array phaseResponse);
*/