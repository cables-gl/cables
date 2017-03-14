op.name='audioOutput';

// constants
var VOLUME_DEFAULT = 1;
var VOLUME_MIN = 0;
var VOLUME_MAX = 1;

// vars
var audioContext = CABLES.WebAudio.createAudioContext(op);
var gainNode = audioContext.createGain();
var destinationNode = audioContext.destination;
gainNode.connect(destinationNode);
var oldVolume = 1;

// inputs
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", gainNode);
var volumePort = op.inValueSlider("Volume", VOLUME_DEFAULT);
var mutePort = op.inValueBool("Mute", false);

// change listeners
mutePort.onChange = function() {
    if(mutePort.get()) {
        gainNode.gain.value = 0;
        var volume = volumePort.get();
        if(volume >= VOLUME_MIN && volume <= VOLUME_MAX) {
            oldVolume = volume;    
        } else {
            oldVolume = 1;
        }
        oldVolume = volume;
    } else {
        gainNode.gain.value = oldVolume;
    }
};
volumePort.onChange = function() {
    var volume = volumePort.get();
    if(volume >= VOLUME_MIN && volume <= VOLUME_MAX) {
        gainNode.gain.value = volume;
    }
};


