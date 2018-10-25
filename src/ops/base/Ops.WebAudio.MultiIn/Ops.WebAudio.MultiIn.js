this.name="MultiIn";

var op = this;

if(!window.audioContext){ audioContext = new AudioContext(); }

var audioOut=this.addOutPort(new CABLES.Port(this,"audio out",CABLES.OP_PORT_TYPE_OBJECT));

var gain = audioContext.createGain();
audioOut.set(gain);

var N_PORTS = 8;

var audioIns = [];
var oldAudioIns = [];

// returns a function that closes around the `current_i` formal parameter.
var createValueChangedFunction = function( port ) {
    // value changed function
    return function() {
        if(audioIns[port].get()){
            oldAudioIns[port] = audioIns[port].get();
            try{
                audioIns[port].get().connect(gain);
            } catch(e) { op.log("[Error] " + e); }
        }
         else if (!audioIns[port].isLinked()){
            try{
                oldAudioIns[port].disconnect(gain);
            } catch(e) { op.log("[Error] " + e); }
        }
    };
};

for(var i=0; i<N_PORTS; i++) {
    var audioIn = this.addInPort(new CABLES.Port(this, "audio in " + i,CABLES.OP_PORT_TYPE_OBJECT));
    audioIn.audioInPortNr = i;
    audioIn.onValueChanged = createValueChangedFunction(i);
    audioIns.push( audioIn );
}
