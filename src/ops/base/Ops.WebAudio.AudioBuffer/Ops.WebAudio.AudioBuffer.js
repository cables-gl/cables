op.name="AudioBuffer";

var audioCtx = CABLES.WebAudio.createAudioContext(op);

// input ports
var inUrlPort = op.addInPort( new Port( op, "URL", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: 'audio'  } ));


// output ports
var audioBufferPort = op.outObject("Audio Buffer");
var finishedLoadingPort = op.outValue("Finished Loading", false);
var sampleRatePort = op.outValue("Sample Rate", 0);
var lengthPort = op.outValue("Length", 0);
var durationPort = op.outValue("Duration", 0);
var numberOfChannelsPort = op.outValue("Number of Channels", 0);

// change listeners
inUrlPort.onChange = function() {
    var url=op.patch.getFilePath(inUrlPort.get());
    if(typeof url === 'string' && url.length > 1) {
        CABLES.WebAudio.loadAudioFile(op.patch, url, onLoadFinished, onLoadFailed);
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
    op.log("Error: Loading audio file failed: ", e);
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