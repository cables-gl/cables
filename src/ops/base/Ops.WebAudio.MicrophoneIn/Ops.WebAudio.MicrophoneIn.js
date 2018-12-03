var microphone = null;
var audioContext=null;

//detect availability of userMedia
var userMediaAvailable = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

const audioOut=this.addOutPort(new CABLES.Port(this, "audio out",CABLES.OP_PORT_TYPE_OBJECT));

if (userMediaAvailable){
    if(!window.audioContext) audioContext = new AudioContext();

    navigator.getUserMedia(
        {audio:true},
        function(stream){
            microphone = audioContext.createMediaStreamSource(stream);
            audioOut.set( microphone );
        },
        function(e){console.log('No live audio input ' + e);}
    );
}
