this.name="Convolver";
var op = this;

if(!window.audioContext){ audioContext = new AudioContext(); }

var NORMALIZE_DEF = true;

var convolver = audioContext.createConvolver();

var audioIn=this.addInPort(new CABLES.Port(this,"audio in",CABLES.OP_PORT_TYPE_OBJECT));
var impulseResponse=this.addInPort(new CABLES.Port(this,"impulse response",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));
var normalize = this.addInPort(new CABLES.Port(this,"normalize",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var audioOut=this.addOutPort(new CABLES.Port(this,"audio out",CABLES.OP_PORT_TYPE_OBJECT));

var oldAudioIn = null;

var convolver = audioContext.createConvolver();
var myImpulseBuffer;

function getImpulse() {
    var impulseUrl = impulseResponse.get();
    var ajaxRequest = new XMLHttpRequest();
    var url = op.patch.getFilePath(impulseUrl);
    if(typeof url === 'string' && url.length > 1) {
        ajaxRequest.open('GET', url, true);
        ajaxRequest.responseType = 'arraybuffer';    
        ajaxRequest.onload = function() {
            var impulseData = ajaxRequest.response;
        
            audioContext.decodeAudioData(impulseData, function(buffer) {
                if(buffer.sampleRate != audioContext.sampleRate) {
                    op.log('[impulse response] Sample rate of the impulse response does not match! Should be ' + audioContext.sampleRate);
                    op.uiAttr( { 'warning': 'Sample rate of the impulse response does not match! Should be ' + audioContext.sampleRate } );
                    return;
                }
                myImpulseBuffer = buffer;
                convolver.buffer = myImpulseBuffer;
                convolver.loop = false;
        		convolver.normalize = normalize.get();
        		try{
        		    audioIn.get().connect(convolver);
        		} catch(e){
        		    op.log("[audio in] Could not connect audio in to convolver" + e);
        		}
                audioOut.set(convolver);
                op.log("[impulse response] Impulse Response (" + impulseUrl + ") loaded");
            }, function(e){
              op.log("[impulse response] Error decoding audio data" + e.err);
              
            });
        };
    
      ajaxRequest.send();
    }
}

impulseResponse.onValueChange( getImpulse );

function onLinkChange(){
    if(!audioIn.isLinked()){
        if(oldAudioIn){
            try{
                op.log("[audio in] Disconnected...");
                oldAudioIn.disconnect(convolver);
            } catch(e){
                op.log("[audio in] Could not disconnect" + e);
            }
        }
    }
}

audioIn.onLinkChanged = onLinkChange;

audioIn.onValueChange(function() {
    if (audioIn.get()) {
        op.log("[audio in] connected");
        try{
            audioIn.get().connect(convolver);
            oldAudioIn = audioIn.get();
        } catch(e){
            op.log("[audio in] Could not connect" + e);
        }
        audioOut.set(convolver);
    }
});

normalize.set(NORMALIZE_DEF);

normalize.onValueChange( function() {
    convolver.normalize = normalize.get();
});
