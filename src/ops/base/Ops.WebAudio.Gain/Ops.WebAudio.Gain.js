
this.name="Gain";

var audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));
var gain=this.addInPort(new Port(this,"gain",OP_PORT_TYPE_VALUE));
gain.onValueChange(updateGain);
var audioOut=this.addOutPort(new Port(this,"audio out",OP_PORT_TYPE_OBJECT));

if(!window.audioContext){ audioContext = new AudioContext(); }

var gainNode = audioContext.createGain();

function updateGain(){
    gainNode.gain.value = parseFloat( gain.get() )||0;
}


var oldAudioIn = null;

audioIn.onValueChanged = function()
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