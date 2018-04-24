this.name="BiquadFilter";

var audioContext = CABLES.WEBAUDIO.createAudioContext(op);

// default values + min and max
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

var biquadFilter = audioContext.createBiquadFilter();

var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", biquadFilter);
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", biquadFilter);

var type = this.addInPort(new Port(this,"type",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['allpass','lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch']}));
var frequency = this.addInPort(new Port(this, "frequency", OP_PORT_TYPE_VALUE, {"display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX}));
var detune = this.addInPort(new Port(this, "detune", OP_PORT_TYPE_VALUE, {"display": "range", "min": DETUNE_MIN, "max": DETUNE_MAX}));
var q = this.addInPort(new Port(this, "q", OP_PORT_TYPE_VALUE, {"display": "range", "min": Q_MIN, "max": Q_MAX}));
var gain = this.addInPort(new Port(this, "gain", OP_PORT_TYPE_VALUE, {"display": "range", "min": GAIN_MIN, "max": GAIN_MAX}));

var updateType = function(){
    biquadFilter.type = type.get();
};

var updateFrequency = function(){
    var freq = frequency.get();
    if(freq && freq >= FREQUENCY_MIN && freq <= FREQUENCY_MAX) {
        // biquadFilter.frequency.value = frequency.get();    
        biquadFilter.frequency.setValueAtTime(frequency.get(), window.audioContext.currentTime);
    }
};

var updateDetune = function(){
    // biquadFilter.detune.value = detune.get();
    biquadFilter.detune.setValueAtTime(detune.get(), window.audioContext.currentTime);
};

var updateQ = function(){
    // biquadFilter.Q.value = q.get();
    biquadFilter.Q.setValueAtTime(q.get(), window.audioContext.currentTime);
};

var updateGain = function(){
    // biquadFilter.gain.value = gain.get();
    biquadFilter.gain.setValueAtTime(gain.get(), window.audioContext.currentTime);
};

type.onValueChange( updateType );
frequency.onValueChange(updateFrequency);
detune.onValueChange(updateDetune);
q.onValueChange(updateQ);
gain.onValueChange(updateGain);


type.set(TYPE_DEF);
frequency.set( FREQUENCY_DEF );
detune.set( DETUNE_DEF );
q.set( Q_DEF );
gain.set( GAIN_DEF );
