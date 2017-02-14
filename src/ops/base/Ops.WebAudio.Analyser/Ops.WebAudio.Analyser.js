op.name='Audio Analyser';

var refresh=op.addInPort(new Port(op,"refresh",OP_PORT_TYPE_FUNCTION));
var audioIn=op.addInPort(new Port(op,"audio in",OP_PORT_TYPE_OBJECT));

var next=op.outFunction("Next");
var audioOut=op.addOutPort(new Port(op, "audio out",OP_PORT_TYPE_OBJECT));
var avgVolume=op.addOutPort(new Port(op, "average volume",OP_PORT_TYPE_VALUE));
var fftOut=op.addOutPort(new Port(op, "fft",OP_PORT_TYPE_ARRAY));

var anData=op.inValueSelect("Data",["Frequency","Time Domain"],"Frequency");

var getFreq=true;

anData.onChange=function()
{
    if(anData.get()=="Frequency")getFreq=true;
    if(anData.get()=="Time Domain")getFreq=false;
    
};


var oldAudioIn=null;

window.AudioContext = window.AudioContext||window.webkitAudioContext;
if(!window.audioContext) window.audioContext = new AudioContext();

var analyser = audioContext.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 256;
var fftBufferLength=0;
var fftDataArray =null;
audioOut.set( analyser );

var array=null;

refresh.onTriggered = function()
{
    if(!array || array.length != analyser.frequencyBinCount)
        array = new Uint8Array(analyser.frequencyBinCount);
    
    if(!array)return;
    analyser.getByteFrequencyData(array);
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    // analyser.smoothingTimeConstant =0.8;

    if(!fftDataArray)return;
    var values = 0;

    for (var i = 0; i < array.length; i++)
        values += array[i];

    var average = values / array.length;
    
    avgVolume.set(average/128);

    if(getFreq) analyser.getByteFrequencyData(2);
        else analyser.getByteTimeDomainData(fftDataArray);
    
    fftOut.set(null);
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

