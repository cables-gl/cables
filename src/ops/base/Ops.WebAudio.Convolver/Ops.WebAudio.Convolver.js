if (!window.audioContext) { audioContext = new AudioContext(); }

const audioIn = op.inObject("audio in");
const impulseResponse = op.inUrl("impulse response");
const normalize = op.inBool("normalize", true);
const audioOut = op.outObject("audio out");

const convolver = audioContext.createConvolver();
let oldAudioIn = null;
let myImpulseBuffer;
let impulseResponseLoaded = false;

function getImpulse()
{
    const impulseUrl = impulseResponse.get();
    const ajaxRequest = new XMLHttpRequest();
    const url = op.patch.getFilePath(impulseUrl);
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
        		audioOut.set(null);
        		try
                {
        		    audioIn.get().connect(convolver);
        		}
                catch (e)
                {
        		    op.log("[audio in] Could not connect audio in to convolver" + e);
        		}

                audioOut.set(convolver);

                op.log("[impulse response] Impulse Response (" + impulseUrl + ") loaded");

                impulseResponseLoaded = true;
                op.setUiError("noIR", null);
            }, function (e)
            {
                op.log("[impulse response] Error decoding audio data" + e.err);
                impulseResponseLoaded = false;
            });
        };

        ajaxRequest.send();
    }
    else
    {
        impulseResponseLoaded = false;
        op.setUiError("noIR", "No impulse response loaded. Original audio will be passed through.", 1);
        if (oldAudioIn)
        {
            oldAudioIn.disconnect(convolver);
            audioOut.set(oldAudioIn);
        }
        else audioOut.set(audioIn.get());
    }
}

impulseResponse.onChange = getImpulse;

/* function onLinkChange(){
    if(!audioIn.isLinked()){
        if(oldAudioIn){
            try{
                op.log("[audio in] Disconnected...");
                oldAudioIn.disconnect(convolver);
            } catch(e){
                op.log("[audio in] Could not disconnect" + e);
            }
        }
    }
} */

// audioIn.onLinkChanged = onLinkChange;

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
            audioIn.get().connect(convolver);
            oldAudioIn = audioIn.get();
        }
        catch (e)
        {
            op.log("[audio in] Could not connect" + e);
        }

        if (!impulseResponseLoaded)
        {
            op.setUiError("noIR", "No impulse response loaded. Original audio will be passed through.", 1);
            audioOut.set(oldAudioIn);
        }
        else
        {
            op.setUiError("noIR", null);
            audioOut.set(convolver);
        }
    }
    else
    {
        if (impulseResponseLoaded)
        {
            op.setUiError("noIR", null);
        }
        op.setUiError("audioCtx", null);
        audioOut.set(null);
    }
};

normalize.onChange = function ()
{
    convolver.normalize = normalize.get();
};
