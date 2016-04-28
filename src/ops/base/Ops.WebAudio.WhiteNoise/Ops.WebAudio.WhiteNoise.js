var self=this;
Op.apply(this, arguments);
this.name="Ops.user.tim.WhiteNoise";

var gain=this.addInPort(new Port(this,"Gain",OP_PORT_TYPE_VALUE));

var audioOut=this.addOutPort(new Port(this,"Audio Out",OP_PORT_TYPE_OBJECT));

var audioContext, gainNode;

if(!audioContext) {
        try {
            // Fix up for prefixing
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            audioContext = new AudioContext();
            gainNode = audioContext.createGainNode();
        }
        catch(e) {
            alert('Web Audio API is not supported in this browser');
        }    
    }
    if(audioContext) {
        var bufferSize = 2 * audioContext.sampleRate,
        noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate),
        output = noiseBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        var whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.start(0);
        
        whiteNoise.connect(gainNode);
        audioOut.set(gainNode);
    }

gain.onValueChange(function()
{
    gainNode.gain.value = gain.get();
});
