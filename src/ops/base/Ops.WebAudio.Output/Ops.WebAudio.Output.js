this.name='audioOutput';
var op=this;

if(!window.audioContext) 
    if('webkitAudioContext' in window) audioContext = new webkitAudioContext();
        else audioContext = new AudioContext();

var audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));

var oldAudioIn=null;

audioIn.onLinkChanged = function() {
    // console.log('[audioIn] is linked: ', audioIn.isLinked());
    
    // console.log('[audio in]: ', audioIn.get());
};

audioIn.onValueChanged = function() {
    // console.log('val: ',audioIn.get() );
    // console.log('is linked: ',audioIn.isLinked());
        
    if (!audioIn.get()) {
        // op.log("audioIn.get() is null");
        if (oldAudioIn !== null) {
            // op.log("oldAudioIn !== null");
            try{
                // op.log("disconnecting: oldAudioIn.disconnect(audioContext.destination); ");
                oldAudioIn.disconnect(audioContext.destination);
            } catch(e) { console.log(e); }
        }
    }
    else {
        audioIn.get().connect(audioContext.destination);
    }
    oldAudioIn = audioIn.get();
};
