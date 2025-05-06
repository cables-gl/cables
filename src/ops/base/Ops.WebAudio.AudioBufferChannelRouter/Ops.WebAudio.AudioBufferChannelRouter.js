const inAudioBuffer = op.inObject("Audio Buffer", null, "audioBuffer");
const inChannelIn = op.inInt("Channel In", 0);
const inChannelOut = op.inInt("Channel Out", 0);
const inClearOthers = op.inBool("Clear Others", false);
const inOffset = op.inBool("Channel Offset", false);

const outAudioBuffer = op.outObject("Audio Buffer Out", null, "audioBuffer");
const outChannels = op.outNumber("Output Channels", 2);

op.setPortGroup("Mode", [inClearOthers, inOffset]);

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const destinationNode = audioCtx.destination;
destinationNode.channelCount = destinationNode.maxChannelCount;

outChannels.set(destinationNode.channelCount);

inClearOthers.onChange = () =>
{
    mixChannel();
};

inOffset.onChange = () =>
{
    inChannelIn.setUiAttribs({ "greyout": inOffset.get() });
    mixChannel();
};

inAudioBuffer.onChange = () =>
{
    mixChannel();
};

inChannelIn.onChange = () =>
{
    let channel = inChannelIn.get();
    const buffer = inAudioBuffer.get();
    if (channel >= 0)
    {
        if (buffer)
        {
            mixChannel();
        }
    }
};

inChannelOut.onChange = () =>
{
    let channel = inChannelOut.get();
    const buffer = inAudioBuffer.get();
    if (channel >= 0)
    {
        if (buffer)
        {
            mixChannel();
        }
    }
};

function mixChannel()
{
    updateUi();
    const buffer = inAudioBuffer.get();
    if (!buffer) return;
    const inChannel = inChannelIn.get() || 0;
    if (inChannel < 0) return;
    const outChannel = inChannelOut.get() || 0;
    const clearOthers = inClearOthers.get();

    let channelCount = Math.max(outChannel + 1, buffer.numberOfChannels);

    const length = buffer.duration * buffer.sampleRate;
    let arrayBuffer = audioCtx.createBuffer(channelCount, length, buffer.sampleRate);

    if (!clearOthers)
    {
        for (let i = 0; i < buffer.numberOfChannels; i++)
        {
            arrayBuffer.copyToChannel(buffer.getChannelData(i), i);
        }
    }

    if (inOffset.get())
    {
        const numChannelsIn = buffer.numberOfChannels;
        const changed = [];
        for (let i = 0; i < buffer.numberOfChannels; i++)
        {
            const targetBuffer = i + inChannelOut.get();
            if (targetBuffer <= (arrayBuffer.numberOfChannels - 1))
            {
                arrayBuffer.copyToChannel(buffer.getChannelData(i), targetBuffer);
            }
        }
    }
    else
    {
        let inChannelData = new Float32Array(arrayBuffer.length);
        if (inChannel <= (buffer.numberOfChannels - 1))
        {
            inChannelData = buffer.getChannelData(inChannel);
        }
        if (outChannel >= 0 && (outChannel <= channelCount - 1)) arrayBuffer.copyToChannel(inChannelData, outChannel);
    }

    outChannels.set(arrayBuffer.numberOfChannels);
    outAudioBuffer.setRef(arrayBuffer);
}

function updateUi()
{
    op.setUiError("in_channel_range", null);
    op.setUiError("out_channel_range", null);

    let channelIn = inChannelIn.get();
    const bufferIn = inAudioBuffer.get();
    let channelOut = inChannelOut.get();
    const bufferOut = inAudioBuffer.get();

    if (channelIn >= 0)
    {
        if (bufferIn)
        {
            const maxChannelIndex = bufferIn.numberOfChannels - 1;
            if (channelIn > maxChannelIndex)
            {
                op.setUiError("in_channel_range", "Input has only " + bufferIn.numberOfChannels + " channels.", 1);
            }
        }
    }
    else
    {
        op.setUiError("in_channel_range", "Ignoring negative value " + channelIn + " for input.", 1);
    }

    if (channelOut >= 0)
    {
        if (bufferOut)
        {
            const maxChannelIndex = destinationNode.channelCount - 1;
            if (channelOut > maxChannelIndex)
            {
                op.setUiError("out_channel_range", "Output has only " + destinationNode.channelCount + " channels.", 1);
            }
        }
    }
    else
    {
        op.setUiError("out_channel_range", "Ignoring negative value " + channelOut + " for output.", 1);
    }
}
