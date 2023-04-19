function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

const MAX_DELAY_TIME_IN_SECONDS = 179.999;

const cgl = op.patch.cgl;
const audioContext = CABLES.WEBAUDIO.createAudioContext(op);

const audioIn = op.inObject("Audio In", null, "audioNode");

const impulseResponse = op.inUrl("Impulse Response");
const normalize = op.inBool("Normalize", true);
const inConvolverGain = op.inFloatSlider("IR Gain", 0.7);
const inPreDelayMS = op.inFloat("Predelay (MS)", 0);

const inDryWet = op.inFloatSlider("Dry/Wet", 0.5);
const inOutputGain = op.inFloatSlider("Output Gain", 1);

const audioOut = op.outObject("Audio Out", null, "audioNode");
const wetOut = op.outObject("Wet Out", null, "audioNode");

op.setPortGroup("IR Options", [impulseResponse, inConvolverGain, normalize, inPreDelayMS]);
op.setPortGroup("Output", [inDryWet, inOutputGain]);

const convolver = audioContext.createConvolver();
const convolverGain = audioContext.createGain();
const predelayNode = audioContext.createDelay(MAX_DELAY_TIME_IN_SECONDS);
const dryNode = audioContext.createGain();
const wetNode = audioContext.createGain();
const inputNode = audioContext.createGain();
const outputNode = audioContext.createGain();

wetNode.gain.value = parseFloat(inDryWet.get());
dryNode.gain.value = 1.0 - parseFloat(inDryWet.get());

wetNode.connect(outputNode);
dryNode.connect(outputNode);
inputNode.connect(dryNode);

inputNode.connect(predelayNode);
predelayNode.connect(convolverGain);
convolverGain.connect(convolver);
convolver.connect(wetNode);

let oldAudioIn = null;
let myImpulseBuffer = null;
let impulseResponseLoaded = false;
let scheduleConnection = false;
let loadingId = null;

impulseResponse.onChange = () =>
{
    loadingId = cgl.patch.loading.start("IR convolver", "", op);
    const impulseUrl = impulseResponse.get();

    const ajaxRequest = new XMLHttpRequest();

    if (impulseUrl)
    {
        const url = op.patch.getFilePath(impulseUrl);
        const ext = url.substr(url.lastIndexOf(".") + 1);

        if (ext === "wav")
        {
            op.setUiError("wavExt", "Even though impulse responses are .wav files most of the time, if you plan on using WebAudio in Safari, make sure you use a .wav file that is 16bit or use an .mp3 file instead.", 1);
        }
        else
        {
            op.setUiError("wavExt", null);
        }

        impulseResponseLoaded = false;
        ajaxRequest.open("GET", url, true);
        ajaxRequest.responseType = "arraybuffer";
        ajaxRequest.onload = function ()
        {
            const impulseData = ajaxRequest.response;

            audioContext.decodeAudioData(impulseData, function (buffer)
            {
                if (buffer.sampleRate != audioContext.sampleRate)
                {
                    op.log("[impulse response] Sample rate of the impulse response does not match! Should be " + audioContext.sampleRate);
                    op.setUiError("wrongSampleRate", "Sample rate of the impulse response does not match! Should be " + audioContext.sampleRate, 2);
                    return;
                }
                else
                {
                    op.setUiError("wrongSampleRate", null);
                }
                myImpulseBuffer = buffer;
                convolver.buffer = myImpulseBuffer;
                convolver.loop = false;
        		convolver.normalize = normalize.get();
        		convolverGain.gain.value = inConvolverGain.get();

        		audioOut.set(null);

        		try
                {
                    if (audioIn.get())
                    {
                        audioIn.get().connect(inputNode);
                        audioOut.set(outputNode);
                        wetOut.set(convolver);
                    }
                    else
                    {
                        scheduleConnection = true;
                    }
        		}
                catch (e)
                {
        		    op.log("[audio in] Could not connect audio in to convolver" + e);
        		}

                op.log("[impulse response] Impulse Response (" + impulseUrl + ") loaded");

                impulseResponseLoaded = true;
                cgl.patch.loading.finished(loadingId);
                op.setUiError("noIR", null);
            }, function (e)
            {
                op.log("[impulse response] Error decoding audio data" + e.err);
                impulseResponseLoaded = false;
                cgl.patch.loading.finished(loadingId);
            });
        };

        ajaxRequest.send();
    }
    else
    {
        impulseResponseLoaded = false;
        op.setUiError("noIR", "No impulse response loaded. Original audio will be passed through the Audio Out output.", 1);
        op.setUiError("wavExt", null);

        convolver.buffer = null;
        audioOut.set(outputNode);
    }
};

inConvolverGain.onChange = () =>
{
    convolverGain.gain.linearRampToValueAtTime(Number(inConvolverGain.get()) || 0, audioContext.currentTime + 0.01);
};

inDryWet.onChange = () =>
{
    wetNode.gain.linearRampToValueAtTime(Number(inDryWet.get()), audioContext.currentTime + 0.01);
    dryNode.gain.linearRampToValueAtTime(1 - Number(inDryWet.get()), audioContext.currentTime + 0.01);
};

inOutputGain.onChange = () =>
{
    outputNode.gain.linearRampToValueAtTime(inOutputGain.get(), audioContext.currentTime + 0.01);
};

inPreDelayMS.onChange = () =>
{
    if (inPreDelayMS.get() < 0) op.setUiError("delayTime", "Pre-Delay should be between 0 ms and " + MAX_DELAY_TIME_IN_SECONDS * 1000 + " ms. Setting to 0.", 1);
    else if (inPreDelayMS.get() > MAX_DELAY_TIME_IN_SECONDS * 1000) op.setUiError("delayTime", "Pre-Delay should be between 0 ms and " + MAX_DELAY_TIME_IN_SECONDS * 1000 + " ms. Setting to " + MAX_DELAY_TIME_IN_SECONDS * 1000 + ".", 1);
    else op.setUiError("delayTime", null);

    const predelayMS = clamp(inPreDelayMS.get(), 0.0, MAX_DELAY_TIME_IN_SECONDS) / 1000;
    predelayNode.delayTime.linearRampToValueAtTime(predelayMS, audioContext.currentTime + 0.05);
};

audioIn.onChange = function ()
{
    if (audioIn.get())
    {
        if (!audioIn.get().connect)
        {
            oldAudioIn = null;
            return;
        }

        op.log("[audio in] connected");

        try
        {
            audioIn.get().connect(inputNode);

            oldAudioIn = audioIn.get();
        }
        catch (e)
        {
            op.log("[audio in] Could not connect" + e);
        }

        if (!impulseResponseLoaded)
        {
            op.setUiError("noIR", "No impulse response loaded. Original audio will be passed through the Audio Out output.", 1);
            audioOut.set(outputNode);
        }
        else
        {
            op.setUiError("noIR", null);
            audioOut.set(outputNode);
            wetOut.set(convolver);
        }
    }
    else
    {
        if (impulseResponseLoaded)
        {
            op.setUiError("noIR", null);
        }

        if (oldAudioIn)
        {
            oldAudioIn.disconnect(inputNode);
        }
        audioOut.set(null);
        wetOut.set(null);

        oldAudioIn = null;
    }
};

normalize.onChange = function ()
{
    convolver.normalize = normalize.get();
};

op.onDelete = () =>
{
    wetNode.disconnect();
    dryNode.disconnect();
    inputNode.disconnect();
    predelayNode.disconnect();
    convolverGain.disconnect();
    convolver.disconnect();
};
