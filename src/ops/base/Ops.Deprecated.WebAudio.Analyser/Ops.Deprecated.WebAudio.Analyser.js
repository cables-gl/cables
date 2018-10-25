CABLES.WEBAUDIO.createAudioContext(op);

// vars
var analyser = audioContext.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 256;
var fftBufferLength = analyser.frequencyBinCount;
var fftDataArray = new Uint8Array(fftBufferLength);
var getFreq=true;
var array=null;

// input ports
var refresh=op.addInPort(new CABLES.Port(op,"refresh",CABLES.OP_PORT_TYPE_FUNCTION));
var audioIn = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", analyser);
var anData=op.inValueSelect("Data",["Frequency","Time Domain"],"Frequency");

// output ports
var next=op.outFunction("Next");
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", analyser);
var avgVolume=op.addOutPort(new CABLES.Port(op, "average volume",CABLES.OP_PORT_TYPE_VALUE));
var fftOut=op.addOutPort(new CABLES.Port(op, "fft",CABLES.OP_PORT_TYPE_ARRAY));

// change listeners
anData.onChange=function() {
    if(anData.get()=="Frequency")getFreq=true;
    if(anData.get()=="Time Domain")getFreq=false;
};



refresh.onTriggered = function() {
    if(!array || array.length != analyser.frequencyBinCount)
        array = new Uint8Array(analyser.frequencyBinCount);
    
    if(!array)return;
    
    //analyser.getByteFrequencyData(array);
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;

    if(!fftDataArray) {
        op.log("fftDataArray is null, returning.");
        return;
    }
    var values = 0;

    for (var i = 0; i < array.length; i++)
    
        values += array[i];
    
    var average = values / array.length;

    
    avgVolume.set(average/128);
    try{
        if(getFreq)
        {
            analyser.getByteFrequencyData(fftDataArray);
        }
        else
        {
            analyser.getByteTimeDomainData(fftDataArray);    
        }
    } catch(e) { op.log(e); }
    
    
    fftOut.set(null);
    fftOut.set(fftDataArray);

    next.trigger();
};

