var self=this;
Op.apply(this, arguments);
this.name="Ops.user.tim.WhiteNoise";

var exec=this.addInPort(new Port(this,"exec",OP_PORT_TYPE_FUNCTION));

var gain=this.addInPort(new Port(this,"gain",OP_PORT_TYPE_VALUE));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var audioContext, gainNode;

exec.onTriggered=function()
{
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
        
        whiteNoise.connect(audioContext.destination);
    }
    trigger.trigger();
}

gain.onValueChange(function()
{
    gainNode.gain.value = gain.get();
});
