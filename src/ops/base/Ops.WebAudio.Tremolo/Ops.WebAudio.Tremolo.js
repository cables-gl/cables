var self=this;
Op.apply(this, arguments);
this.name="Ops.tim.WebAudio.Tremolo";

var audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));
var min=this.addInPort(new Port(this,"min",OP_PORT_TYPE_VALUE));
var max=this.addInPort(new Port(this,"max",OP_PORT_TYPE_VALUE));
var frequency=this.addInPort(new Port(this,"frequency",OP_PORT_TYPE_VALUE));



var audioOut=this.addOutPort(new Port(this,"audio out",OP_PORT_TYPE_OBJECT));

if(!window.audioContext){ audioContext = new AudioContext(); }

var gainNode = audioContext.createGain();

function updateGain(){
    gainNode.gain.value = parseFloat( gain.get() );
}


this.oldAudioIn=null;

audioIn.onValueChanged = function()
{
    if (!audioIn.get()) {
        if (oldAudioIn !== null) {
            try{
                oldAudioIn.disconnect();
            } catch(e) {
                console.log(e);
            }
        }
    } else {
        //audioIn.val.connect(audioContext.destination);
        audioIn.val.connect(gainNode);
    }
    oldAudioIn=audioIn.val;
};

audioOut.set( gainNode );
min.set( 0.0 );
max.set( 1.0 );
frequency.set( 5 );