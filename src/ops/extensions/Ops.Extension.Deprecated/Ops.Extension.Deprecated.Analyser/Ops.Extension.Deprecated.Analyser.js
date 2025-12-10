CABLES.WEBAUDIO.createAudioContext(op);

// vars
let analyser = audioContext.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 256;
let fftBufferLength = analyser.frequencyBinCount;
let fftDataArray = new Uint8Array(fftBufferLength);
let getFreq = true;
let array = null;

// input ports
let refresh = op.addInPort(new CABLES.Port(op, "refresh", CABLES.OP_PORT_TYPE_FUNCTION));
let audioIn = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", analyser);
let anData = op.inValueSelect("Data", ["Frequency", "Time Domain"], "Frequency");

// output ports
let next = op.outTrigger("Next");
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", analyser);
let avgVolume = op.addOutPort(new CABLES.Port(op, "average volume", CABLES.OP_PORT_TYPE_VALUE));
let fftOut = op.addOutPort(new CABLES.Port(op, "fft", CABLES.OP_PORT_TYPE_ARRAY));

// change listeners
anData.onChange = function ()
{
    if (anData.get() == "Frequency")getFreq = true;
    if (anData.get() == "Time Domain")getFreq = false;
};

refresh.onTriggered = function ()
{
    if (!array || array.length != analyser.frequencyBinCount)
        array = new Uint8Array(analyser.frequencyBinCount);

    if (!array) return;

    // analyser.getByteFrequencyData(array);
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;

    if (!fftDataArray)
    {
        op.log("fftDataArray is null, returning.");
        return;
    }
    let values = 0;

    for (let i = 0; i < array.length; i++)

        values += array[i];

    let average = values / array.length;

    avgVolume.set(average / 128);
    try
    {
        if (getFreq)
        {
            analyser.getByteFrequencyData(fftDataArray);
        }
        else
        {
            analyser.getByteTimeDomainData(fftDataArray);
        }
    }
    catch (e) { op.log(e); }

    fftOut.set(null);
    fftOut.set(fftDataArray);

    next.trigger();
};
