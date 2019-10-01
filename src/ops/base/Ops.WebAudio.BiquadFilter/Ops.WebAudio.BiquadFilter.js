this.name="BiquadFilter";

var audioContext = CABLES.WEBAUDIO.createAudioContext(op);

// default values + min and max
var FREQUENCY_MIN = 10;
var FREQUENCY_MAX = audioContext.sampleRate / 2; // Nyquist frequency.
var TYPE_DEF = "allpass";

var biquadFilter = audioContext.createBiquadFilter();

var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", biquadFilter);
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", biquadFilter);

var type = op.inValueSelect ("type",['allpass','lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch'],'allpass');

var frequency = op.inFloat("frequency",1000);

var detune = op.inFloatSlider("detune",0);
var q = op.inFloatSlider("q",0);
var gain = op.inFloatSlider("gain",0.5);

var updateType = function(){
    biquadFilter.type = type.get();
};

var updateFrequency = function()
{
    var freq = frequency.get();
    if(freq && freq >= FREQUENCY_MIN && freq <= FREQUENCY_MAX)
    {
        biquadFilter.frequency.setValueAtTime(frequency.get(), window.audioContext.currentTime);
    }
};

var updateDetune = function()
{
    biquadFilter.detune.setValueAtTime(detune.get(), window.audioContext.currentTime);
};

var updateQ = function()
{
    biquadFilter.Q.setValueAtTime(q.get(), window.audioContext.currentTime);
};

var updateGain = function()
{
    biquadFilter.gain.setValueAtTime(gain.get(), window.audioContext.currentTime);
};

type.onChange=updateType;
frequency.onChange=updateFrequency;
detune.onChange=updateDetune;
q.onChange=updateQ;
gain.onChange=updateGain;

updateType();

