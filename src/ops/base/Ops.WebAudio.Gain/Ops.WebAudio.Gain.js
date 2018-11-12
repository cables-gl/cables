
this.name="Gain";

var audioIn=this.addInPort(new CABLES.Port(this,"audio in",CABLES.OP_PORT_TYPE_OBJECT));
var gain=this.addInPort(new CABLES.Port(this,"gain",CABLES.OP_PORT_TYPE_VALUE));
gain.onValueChange(updateGain);
var audioOut=this.addOutPort(new CABLES.Port(this,"audio out",CABLES.OP_PORT_TYPE_OBJECT));

if(!window.audioContext){ audioContext = new AudioContext(); }

var gainNode = audioContext.createGain();

function updateGain(){
    // gainNode.gain.value = parseFloat( gain.get() )||0;
    gainNode.gain.setValueAtTime(parseFloat(gain.get()) || 0, window.audioContext.currentTime);
}


var oldAudioIn = null;

audioIn.onChange=function()
{
    if (!audioIn.get()) {
        if (oldAudioIn) {
            try{
                oldAudioIn.disconnect(gainNode);
            } catch(e) {
                
                
                console.log(e);
            }
        }
    } else {
        audioIn.val.connect(gainNode);
    }  
    oldAudioIn=audioIn.get();
};

gain.set( 1.0 );
audioOut.set( gainNode );