op.name='Audio Analyser';

var refresh=op.addInPort(new Port(op,"refresh",OP_PORT_TYPE_FUNCTION));
var audioIn=op.addInPort(new Port(op,"audio in",OP_PORT_TYPE_OBJECT));

var next=op.outFunction("Next");
var audioOut=op.addOutPort(new Port(op, "audio out",OP_PORT_TYPE_OBJECT));
var avgVolume=op.addOutPort(new Port(op, "average volume",OP_PORT_TYPE_VALUE));
var fftOut=op.addOutPort(new Port(op, "fft",OP_PORT_TYPE_ARRAY));

var oldAudioIn=null;

window.AudioContext = window.AudioContext||window.webkitAudioContext;
if(!window.audioContext) window.audioContext = new AudioContext();

var analyser = audioContext.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 256;
var fftBufferLength=0;
var fftDataArray =null;
audioOut.set( analyser );


refresh.onTriggered = function()
{
    var array = new Uint8Array(analyser.frequencyBinCount);
    
    if(!array)return;
    analyser.getByteFrequencyData(array);
    analyser.minDecibels = -110;
    analyser.maxDecibels = -10;

    if(!fftDataArray)return;
    var values = 0;
    var average;

    for (var i = 0; i < array.length; i++)
    {
        values += array[i];
    }

    average = values / array.length;
    
    avgVolume.set(average/128);

    analyser.getByteFrequencyData(fftDataArray);
    fftOut.set(fftDataArray);
    
    
    
    next.trigger();
};

audioIn.onChange = function()
{
    if (!audioIn.get())
    {
        if(oldAudioIn) oldAudioIn.disconnect(analyser);
    }
    else 
    {
        audioIn.get().connect(analyser);
    }
    oldAudioIn=audioIn.get();

    fftBufferLength = analyser.frequencyBinCount;
    fftDataArray = new Uint8Array(fftBufferLength);
};

