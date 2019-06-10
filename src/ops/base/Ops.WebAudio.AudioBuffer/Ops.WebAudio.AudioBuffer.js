const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
const inUrlPort = op.inFile("URL",'audio');
const audioBufferPort = op.outObject("Audio Buffer");
const finishedLoadingPort = op.outValue("Finished Loading", false);
const sampleRatePort = op.outValue("Sample Rate", 0);
const lengthPort = op.outValue("Length", 0);
const durationPort = op.outValue("Duration", 0);
const numberOfChannelsPort = op.outValue("Number of Channels", 0);

// change listeners
inUrlPort.onChange = function() {
    var url=op.patch.getFilePath(inUrlPort.get());
    if(typeof url === 'string' && url.length > 1) {
        CABLES.WEBAUDIO.loadAudioFile(op.patch, url, onLoadFinished, onLoadFailed);
    }
};

function onLoadFinished(buffer) {
    lengthPort.set(buffer.length);
    durationPort.set(buffer.duration);
    numberOfChannelsPort.set(buffer.numberOfChannels);
    sampleRatePort.set(buffer.sampleRate);
    audioBufferPort.set(buffer);
    finishedLoadingPort.set(true);
    op.log("AudioBuffer loaded: ", buffer);
}

function onLoadFailed(e) {
    console.error("Error: Loading audio file failed: ", e);
    invalidateOutPorts();
}

function invalidateOutPorts() {
    lengthPort.set(0);
    durationPort.set(0);
    numberOfChannelsPort.set(0);
    sampleRatePort.set(0);
    audioBufferPort.set(0);
    finishedLoadingPort.set(false);
}