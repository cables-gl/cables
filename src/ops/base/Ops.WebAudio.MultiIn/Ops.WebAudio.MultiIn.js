this.name="Ops.WebAudio.MultiIn";

var op = this;

if(!window.audioContext){ audioContext = new AudioContext(); }

var audioOut=this.addOutPort(new Port(this,"audio out",OP_PORT_TYPE_OBJECT));

var gain = audioContext.createGain();
audioOut.set(gain);

var N_PORTS = 8;

var audioIns = [];
var oldAudioIns = [];

// returns a function that closes around the `current_i` formal parameter.
var createValueChangedFunction = function( port ) {
    // value changed function
    return function() {
        op.log("In Port " + port + " changed");
        op.log("audio ins: ");
        console.log(audioIns[port]);
        if(audioIns[port].get()){
            op.log("Linked");
            oldAudioIns[port] = audioIns[port].get();
            audioIns[port].get().connect(gain);
        }
         else if (!audioIns[port].isLinked()){
            try{
                oldAudioIns[port].disconnect(gain);
            } catch(e) { op.log("[Error] " + e); }
        }
    };
};

for(var i=0; i<N_PORTS; i++) {
    var audioIn = this.addInPort(new Port(this, "audio in " + i, OP_PORT_TYPE_OBJECT));
    audioIn.audioInPortNr = i;
    audioIn.onValueChanged = createValueChangedFunction(i);
    audioIns.push( audioIn );
}
