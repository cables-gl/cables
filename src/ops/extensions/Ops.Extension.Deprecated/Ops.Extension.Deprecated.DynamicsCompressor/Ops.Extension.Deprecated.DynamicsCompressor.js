if (!window.audioContext)
    if ("webkitAudioContext" in window) audioContext = new webkitAudioContext();
    else audioContext = new AudioContext();

// In Ports
let audioIn = this.addInPort(new CABLES.Port(this, "audio in", CABLES.OP_PORT_TYPE_OBJECT));

// Constants - see http://webaudio.github.io/web-audio-api/#idl-def-DynamicsCompressorNode
let ATTACK_MIN = 0.0;
let ATTACK_MAX = 1.0;
let ATTACK_DEF = 0.003;
let KNEE_MIN = 0;
let KNEE_MAX = 40;
let KNEE_DEF = 30;
let RATIO_MIN = 1;
let RATIO_MAX = 20;
let RATIO_DEF = 12;
let RELEASE_MIN = 0.0;
let RELEASE_MAX = 1.0;
let RELEASE_DEF = 0.250;
let THRESHOLD_MIN = -100;
let THRESHOLD_MAX = 0;
let THRESHOLD_DEF = -24;

let threshold = this.addInPort(new CABLES.Port(this, "threshold", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": THRESHOLD_MIN, "max": THRESHOLD_MAX }));
let knee = this.addInPort(new CABLES.Port(this, "knee", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": KNEE_MIN, "max": KNEE_MAX }));
let ratio = this.addInPort(new CABLES.Port(this, "ratio", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": RATIO_MIN, "max": RATIO_MAX }));
let attack = this.addInPort(new CABLES.Port(this, "attack", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": ATTACK_MIN, "max": ATTACK_MAX }));
let release = this.addInPort(new CABLES.Port(this, "release", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": RELEASE_MIN, "max": RELEASE_MAX }));

this.exe = this.addInPort(new CABLES.Port(this, "exe", CABLES.OP_PORT_TYPE_FUNCTION));

// Out Ports
let audioOut = this.addOutPort(new CABLES.Port(this, "audio out", CABLES.OP_PORT_TYPE_OBJECT));
let reduction = this.addOutPort(new CABLES.Port(this, "reduction", CABLES.OP_PORT_TYPE_VALUE));

// Reference needed to disconnect
let oldAudioIn = null;

let compressor = audioContext.createDynamicsCompressor();

// Audio In Value Change
audioIn.onChange = function ()
{
    if (!audioIn.get())
    {
        if (oldAudioIn !== null)
        {
            try
            {
                oldAudioIn.disconnect(compressor);
            }
            catch (e) { console.log(e); }
        }
    }
    else
    {
        audioIn.val.connect(compressor);
    }
    oldAudioIn = audioIn.val;
};

// exe – only needed, to update the reduction value (useful for debugging and make-up gain ops)
this.exe.onTriggered = function ()
{
    if (compressor) reduction.set(compressor.reduction.value);
};

function checkBounds(value, min, max)
{
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

// Value Change Callbacks

attack.onChange = function ()
{
    compressor.attack.value = checkBounds(parseFloat(attack.get(), ATTACK_MIN, ATTACK_MAX));
    attack.set(compressor.attack.value); // update UI with clamped value
};

knee.onChange = function ()
{
    compressor.knee.value = checkBounds(parseFloat(knee.get()), KNEE_MIN, KNEE_MAX);
    knee.set(compressor.knee.value); // update UI with clamped value
};

ratio.onChange = function ()
{
    compressor.ratio.value = checkBounds(parseFloat(ratio.get()), RATIO_MIN, RATIO_MAX);
    ratio.set(compressor.ratio.value); // update UI with clamped value
};

release.onChange = function ()
{
    compressor.release.value = checkBounds(parseFloat(release.get()), RELEASE_MIN, RELEASE_MAX);
    release.set(compressor.release.value); // update UI with clamped value
};

threshold.onChange = function ()
{
    compressor.threshold.value = checkBounds(parseFloat(threshold.get()), THRESHOLD_MIN, THRESHOLD_MAX);
    threshold.set(compressor.threshold.value); // update UI with clamped value
};

// Init In-Port Values
attack.set(ATTACK_DEF);
knee.set(KNEE_DEF);
ratio.set(RATIO_DEF);
release.set(RELEASE_DEF);
threshold.set(THRESHOLD_DEF);

// Set Out Port
audioOut.set(compressor);
