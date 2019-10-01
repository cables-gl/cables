this.name="BiquadFilter";

var audioContext = CABLES.WEBAUDIO.createAudioContext(op);

// default values + min and max
var FREQUENCY_MIN = 10;
var FREQUENCY_MAX = audioContext.sampleRate / 2; // Nyquist frequency.
var TYPE_DEF = "allpass";

var biquadFilter = audioContext.createBiquadFilter();

var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", biquadFilter);
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", biquadFilter);

// var type = this.addInPort(new CABLES.Port(this,"type",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['allpass','lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch']}));

var type = op.inValueSelect ("type",['allpass','lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch'],'allpass');

// type.set('allpass');
// var frequency = this.addInPort(new CABLES.Port(this, "frequency", CABLES.OP_PORT_TYPE_VALUE, {"display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX}));
var frequency = op.inFloat("frequency",1000);

// var detune = this.addInPort(new CABLES.Port(this, "detune", CABLES.OP_PORT_TYPE_VALUE, {"display": "range", "min": DETUNE_MIN, "max": DETUNE_MAX}));
var detune = op.inFloatSlider("detune",0);// (new CABLES.Port(this, "detune", CABLES.OP_PORT_TYPE_VALUE, {"display": "range", "min": DETUNE_MIN, "max": DETUNE_MAX}));
var q = op.inFloatSlider("q",0);//this.addInPort(new CABLES.Port(this, "q", CABLES.OP_PORT_TYPE_VALUE, {"display": "range", "min": Q_MIN, "max": Q_MAX}));
var gain = op.inFloatSlider("gain",0.5);//this.addInPort(new CABLES.Port(this, "gain", CABLES.OP_PORT_TYPE_VALUE, {"display": "range", "min": GAIN_MIN, "max": GAIN_MAX}));

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

type.onChange=updateType;
frequency.onChange=updateFrequency;
detune.onChange=updateDetune;
q.onChange=updateQ;
gain.onChange=updateGain;

updateType();

