op.name='audioOutput';

window.AudioContext = window.AudioContext||window.webkitAudioContext;
if(!window.audioContext) window.audioContext = new AudioContext();

var audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));
var oldAudioIn=null;

audioIn.onValueChanged = function() {

    if (!audioIn.get())
    {
        if (oldAudioIn !== null)
        {
            try
            {
                oldAudioIn.disconnect(audioContext.destination);
            }
            catch(e) { console.log(e); }
        }
    }
    else
    {
        audioIn.get().connect(audioContext.destination);
    }
    oldAudioIn = audioIn.get();
};
