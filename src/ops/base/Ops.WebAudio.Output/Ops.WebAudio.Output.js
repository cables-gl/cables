var self=this;
Op.apply(this, arguments);

if(!window.audioContext) 
    if('webkitAudioContext' in window) audioContext = new webkitAudioContext();
        else audioContext = new AudioContext();

this.name='audioOutput';
var audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));

this.oldAudioIn=null;

audioIn.onValueChanged = function()
{

    console.log(audioIn.val);
    if (!audioIn.get())
    {
        if (oldAudioIn !== null)
        {
            oldAudioIn.disconnect(audioContext.destination);
        }
    }
    else
    {
        audioIn.val.connect(audioContext.destination);
    }
    oldAudioIn=audioIn.val;
};
