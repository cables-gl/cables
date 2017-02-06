op.name="Gain";

CABLES.WebAudio.createAudioContext(op);

// input ports
var audioIn=this.addInPort(new Port(this,"Audio In",OP_PORT_TYPE_OBJECT));
var gainPort = op.inObject("Gain");

// output ports
var audioOut=this.addOutPort(new Port(this,"Audio Out",OP_PORT_TYPE_OBJECT));

// vars
var gainNode = new Tone.Gain();
var oldAudioIn = null;
var oldGainIn = null;

// default values
var DEFAULT_GAIN_GAIN = 1;

gainPort.onChange = function() {
    op.log("gain In: ", gainPort.get());
    var gainIn = gainPort.get();
    if(gainIn) {
        if(typeof gainIn === 'object')
        gainIn.connect(gainNode.gain);
        oldGainIn = gainIn;
    } else {
        if(oldGainIn && typeof olfGainIn === 'object') {
            //oldGainIn.disconnect(gainNode.gain);
            oldGainIn = null;    
        }
    }
};

// change listeners
audioIn.onValueChanged = function() {
    if (!audioIn.get()) {
        if (oldAudioIn !== null) {
            try{
                oldAudioIn.disconnect(gainNode);
            } catch(e) {
                console.log(e);
            }
        }
    } else {
        op.log("audioIn.get(): ", audioIn.get());
        op.log("gainNode: ", gainNode);
        audioIn.get().connect(gainNode);
    }  
    oldAudioIn=audioIn.val;
};

// set input ports
gainPort.set(DEFAULT_GAIN_GAIN);

// set out ports
audioOut.set( gainNode );








