
let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// constants
let VOLUME_DEFAULT = 1.0;
let VOLUME_MIN = 0;
let VOLUME_MAX = 1;

// vars
let gainNode = audioCtx.createGain();
let destinationNode = audioCtx.destination;
gainNode.connect(destinationNode);
let masterVolume = 1;

// inputs
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", gainNode);
let volumePort = op.inValueSlider("Volume", VOLUME_DEFAULT);
let mutePort = op.inValueBool("Mute", false);

// functions
// sets the volume, multiplied by master volume
function setVolume()
{
    let volume = volumePort.get() * masterVolume;
    if (volume >= VOLUME_MIN && volume <= VOLUME_MAX)
    {
        // gainNode.gain.value = volume;
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    }
    else
    {
        // gainNode.gain.value = VOLUME_DEFAULT * masterVolume;
        gainNode.gain.setValueAtTime(VOLUME_DEFAULT * masterVolume, audioCtx.currentTime);
    }
}

function mute(b)
{
    if (b)
    {
        // gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    }
    else
    {
        setVolume();
    }
}

// change listeners
mutePort.onChange = function ()
{
    mute(mutePort.get());
};

volumePort.onChange = function ()
{
    if (mutePort.get())
    {
        return;
    }
    setVolume();
};

op.onMasterVolumeChanged = function (v)
{
    masterVolume = v;
    setVolume();
};
