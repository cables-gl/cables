const cgl = op.patch.cgl;
const audioContext = CABLES.WEBAUDIO.createAudioContext(op);

const audioIn = op.inObject("Audio In");
const impulseResponse = op.inUrl("Impulse Response");
const inConvolverGain = op.inFloatSlider("IR Gain", 1);
const normalize = op.inBool("Normalize", true);
const inOutputGain = op.inFloatSlider("Output Gain", 1);

const audioOut = op.outObject("Audio Out");

op.setPortGroup("IR Options", [impulseResponse, inConvolverGain, normalize]);
op.setPortGroup("Output", [inOutputGain]);

const convolver = audioContext.createConvolver();
const convolverGain = audioContext.createGain();
const outputNode = audioContext.createGain();

let oldAudioIn = null;
let myImpulseBuffer;
let impulseResponseLoaded = false;
let scheduleConnection = false;
let loadingId = null;

impulseResponse.onChange = () =>
{
    loadingId = cgl.patch.loading.start("IR convolver", "");
    const impulseUrl = impulseResponse.get();

    const ajaxRequest = new XMLHttpRequest();
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
    if (impulseUrl)
    {
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
                        audioIn.get().connect(convolverGain);
                        audioIn.get().connect(outputNode);
            		    convolverGain.connect(convolver);
            		    convolver.connect(outputNode);
                        audioOut.set(outputNode);
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
        op.setUiError("noIR", "No impulse response loaded. Original audio will be passed through.", 1);

        convolver.buffer = null;
        audioOut.set(outputNode);
    }
};

inConvolverGain.onChange = () =>
{
    convolverGain.gain.setValueAtTime((inConvolverGain.get() || 0), audioContext.currentTime);
};

inOutputGain.onChange = () =>
{
    outputNode.gain.setValueAtTime((inOutputGain.get() || 0), audioContext.currentTime);
};

audioIn.onChange = function ()
{
    if (audioIn.get())
    {
        if (!audioIn.get().connect)
        {
            op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
            oldAudioIn = null;
            return;
        }
        else
        {
            op.setUiError("audioCtx", null);
        }
        op.log("[audio in] connected");

        try
        {
            audioIn.get().connect(outputNode);
            audioIn.get().connect(convolverGain);

            if (scheduleConnection)
            {
    		    convolverGain.connect(convolver);
    		    convolver.connect(outputNode);
    		    scheduleConnection = false;
            }

            oldAudioIn = audioIn.get();
        }
        catch (e)
        {
            op.log("[audio in] Could not connect" + e);
        }

        if (!impulseResponseLoaded)
        {
            op.setUiError("noIR", "No impulse response loaded. Original audio will be passed through.", 1);
            audioOut.set(outputNode);
        }
        else
        {
            op.setUiError("noIR", null);
            audioOut.set(outputNode);
        }
    }
    else
    {
        if (impulseResponseLoaded)
        {
            op.setUiError("noIR", null);
        }
        op.setUiError("audioCtx", null);
        if (oldAudioIn) oldAudioIn.disconnect(outputNode);
        audioOut.set(null);
        oldAudioIn = null;
    }
};

normalize.onChange = function ()
{
    convolver.normalize = normalize.get();
};
