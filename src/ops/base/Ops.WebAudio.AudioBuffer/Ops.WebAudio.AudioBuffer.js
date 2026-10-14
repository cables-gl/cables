const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
const inUrlPort = op.inFile("URL", "audio");
const audioBufferPort = op.outObject("Audio Buffer");
const finishedLoadingPort = op.outNumber("Finished Loading", false);
const sampleRatePort = op.outNumber("Sample Rate", 0);
const lengthPort = op.outNumber("Length", 0);
const durationPort = op.outNumber("Duration", 0);
const numberOfChannelsPort = op.outNumber("Number of Channels", 0);

// change listeners
inUrlPort.onChange = function ()
{
    let url = op.patch.getFilePath(inUrlPort.get());
    if (typeof url === "string" && url.length > 1)
    {
        CABLES.WEBAUDIO.loadAudioFile(op.patch, url, onLoadFinished, onLoadFailed);
    }
};

function onLoadFinished(buffer)
{
    lengthPort.set(buffer.length);
    durationPort.set(buffer.duration);
    numberOfChannelsPort.set(buffer.numberOfChannels);
    sampleRatePort.set(buffer.sampleRate);
    audioBufferPort.set(buffer);
    finishedLoadingPort.set(true);
    // op.log("AudioBuffer loaded: ", buffer);
}

function onLoadFailed(e)
{
    // op.logError("Error: Loading audio file failed: ", e);
    invalidateOutPorts();
}

function invalidateOutPorts()
{
    lengthPort.set(0);
    durationPort.set(0);
    numberOfChannelsPort.set(0);
    sampleRatePort.set(0);
    audioBufferPort.set(0);
    finishedLoadingPort.set(false);
}
