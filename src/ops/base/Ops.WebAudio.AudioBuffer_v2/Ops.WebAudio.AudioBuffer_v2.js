const
    audioCtx = CABLES.WEBAUDIO.createAudioContext(op),
    inUrlPort = op.inUrl("URL", "audio"),
    audioBufferPort = op.outObject("Audio Buffer"),
    finishedLoadingPort = op.outValue("Finished Loading", false),
    sampleRatePort = op.outValue("Sample Rate", 0),
    lengthPort = op.outValue("Length", 0),
    durationPort = op.outValue("Duration", 0),
    numberOfChannelsPort = op.outValue("Number of Channels", 0),
    outLoading = op.outBool("isLoading", 0);

let currentBuffer = null;
let isLoading = false;
let currentFileUrl = null;
let urlToLoadNext = null;

if (!audioBufferPort.isLinked())
{
    op.setUiError("notConnected", "To play back sound, connect this op to a playback operator such as SamplePlayer or AudioBufferPlayer.", 0);
}
else
{
    op.setUiError("notConnected", null);
}

audioBufferPort.onLinkChanged = () =>
{
    if (audioBufferPort.isLinked())
    {
        op.setUiError("notConnected", null);
    }
    else
    {
        op.setUiError("notConnected", "To play back sound, connect this op to a playback operator such as SamplePlayer or AudioBufferPlayer.", 0);
    }
};

function loadAudioFile(url)
{
    const ext = url.substr(url.lastIndexOf(".") + 1);
    if (ext === "wav")
    {
        op.setUiError("wavFormat", "You are using a .wav file. Make sure the .wav file is 16 bit to be supported by all browsers. Safari does not support 24 bit .wav files.", 1);
    }
    else
    {
        op.setUiError("wavFormat", null);
    }
    currentFileUrl = url;
    isLoading = true;
    outLoading.set(isLoading);
    CABLES.WEBAUDIO.loadAudioFile(op.patch, url, onLoadFinished, onLoadFailed);
}
// change listeners
inUrlPort.onChange = function ()
{
    if (inUrlPort.get())
    {
        if (isLoading)
        {
            const newUrl = op.patch.getFilePath(inUrlPort.get());
            if (newUrl !== currentFileUrl)
            {
                urlToLoadNext = newUrl;
            }
            else
            {
                urlToLoadNext = null;
            }

            return;
        }

        invalidateOutPorts();
        const url = op.patch.getFilePath(inUrlPort.get());
        loadAudioFile(url);
    }
    else
    {
        if (isLoading) return;
        invalidateOutPorts();
        op.setUiError("wavFormat", null);
        op.setUiError("failedLoading", null);
    }
};

function onLoadFinished(buffer)
{
    isLoading = false;
    outLoading.set(isLoading);

    if (urlToLoadNext)
    {
        loadAudioFile(urlToLoadNext);
        urlToLoadNext = null;
    }
    else
    {
        currentBuffer = buffer;
        lengthPort.set(buffer.length);
        durationPort.set(buffer.duration);
        numberOfChannelsPort.set(buffer.numberOfChannels);
        sampleRatePort.set(buffer.sampleRate);
        audioBufferPort.set(buffer);
        op.setUiError("failedLoading", null);
        finishedLoadingPort.set(true);
    }
}

function onLoadFailed(e)
{
    op.error("Error: Loading audio file failed: ", e);
    op.setUiError("failedLoading", "The audio file could not be loaded. Make sure the right file URL is used.", 2);
    isLoading = false;
    invalidateOutPorts();
    outLoading.set(isLoading);
    currentBuffer = null;
    if (urlToLoadNext)
    {
        loadAudioFile(urlToLoadNext);
        urlToLoadNext = null;
    }
}

function invalidateOutPorts()
{
    lengthPort.set(0);
    durationPort.set(0);
    numberOfChannelsPort.set(0);
    sampleRatePort.set(0);

    // if (currentBuffer === null)
    // {
    audioBufferPort.set(null);
    // }

    finishedLoadingPort.set(false);
}
