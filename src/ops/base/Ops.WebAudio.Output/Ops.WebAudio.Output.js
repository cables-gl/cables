var self=this;
Op.apply(this, arguments);

if(!window.audioContext) 
    if('webkitAudioContext' in window) audioContext = new webkitAudioContext();
        else audioContext = new AudioContext();

this.name='audioOutput';
var audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));




var oldAudioIn=null;

audioIn.onLinkChanged = function()
{
    console.log('onlink is linked: ',audioIn.isLinked());
    
    console.log('onlink is linked: ',audioIn.get());
    
    // if(!audioIn.isLinked() && oldAudioIn)
    // {
    //     oldAudioIn.disconnect(audioContext.destination);
    // }
    // else
    // {
    //     audioIn.val.connect(audioContext.destination);
    //     oldAudioIn=audioIn.val;
    // }
};






audioIn.onValueChanged = function()
{

    console.log('val: ',audioIn.get() );
    console.log('is linked: ',audioIn.isLinked());
        
    if (!audioIn.get())
    {
        if (oldAudioIn !== null)
        {
            try{
                oldAudioIn.disconnect(audioContext.destination); // TODO, we don't know whichport to disconnect....
            } catch(e) { console.log(e); }
        }
    }
    else
    {
        audioIn.val.connect(audioContext.destination);
    }
    oldAudioIn=audioIn.val;
};
