var self = this;
Op.apply(this, arguments);
this.microphone = null;

this.name='microphone';

//detect availability of userMedia
this.userMediaAvailable = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

this.audioOut=this.addOutPort(new Port(this, "audio out",OP_PORT_TYPE_OBJECT));

if (this.userMediaAvailable){
    if(!window.audioContext) {
         audioContext = new AudioContext();
    }

    navigator.getUserMedia(
        {audio:true},
        function(stream){
            self.microphone = audioContext.createMediaStreamSource(stream);
            self.audioOut.val = self.microphone;
        },
        function(e){console.log('No live audio input ' + e);}
    );
}
