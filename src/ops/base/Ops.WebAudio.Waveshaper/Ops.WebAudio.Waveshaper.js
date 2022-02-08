let audioContext = CABLES.WEBAUDIO.createAudioContext(op);

const inAudio = op.inObject("audio in", null, "audioNode");
const inDryWet = op.inFloatSlider("Dry/Wet", 1);
const inOversampling = op.inSwitch("Oversampling", ["none", "2x", "4x"], "4x");
const inDistortionAmount = op.inInt("Distortion Amount", 15);

const inWaveshapeArray = op.inArray("Waveshape Array In");
const inOutputGain = op.inFloatSlider("Output Gain", 0.5);

op.setPortGroup("Waveshape Settings", [inOversampling, inDistortionAmount, inWaveshapeArray]);
const audioOut = op.outObject("audio out", null, "audioNode");
const outCurve = op.outArray("Curve Out");
const outCurveLength = op.outNumber("Curve Length");

// * webaudio nodes * //
const inputNode = audioContext.createGain();
const dryNode = audioContext.createGain();
const wetNode = audioContext.createGain();
const outputNode = audioContext.createGain();
wetNode.gain.value = parseFloat(inDryWet.get());
dryNode.gain.value = 1.0 - parseFloat(inDryWet.get());

const waveshaperNode = audioContext.createWaveShaper();

function makeDefaultDistortionCurve(amount)
{
    let n_samples = 256, curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i)
    {
        // normalize [-1,1];
        let x = i * 2 / n_samples - 1;
        // transfer function
        curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}

waveshaperNode.curve = makeDefaultDistortionCurve(400);
waveshaperNode.oversample = inOversampling.get();
outCurve.set(waveshaperNode.curve);
outCurve.set(waveshaperNode.curve.length);
inputNode.connect(dryNode);
inputNode.connect(waveshaperNode);

dryNode.connect(outputNode);
waveshaperNode.connect(wetNode);

wetNode.connect(outputNode);

changeDistortion();

function changeDistortion()
{
    if (inWaveshapeArray.get())
    {
        inDistortionAmount.setUiAttribs({ "greyout": true });
        waveshaperNode.curve = Float32Array.from(inWaveshapeArray.get());
    }
    else
    {
        inDistortionAmount.setUiAttribs({ "greyout": false });
        if (inDistortionAmount.get() < 0)
        {
            op.setUiError("distAmountOutOfRange", "The minimum amount of possible distortion is 0. Choosing values lower than 0 will set them to 0.", 1);
        }
        else
        {
            op.setUiError("distAmountOutOfRange", null);
        }
        waveshaperNode.curve = makeDefaultDistortionCurve(Math.max(0, inDistortionAmount.get()));
    }

    outCurve.set(Array.from(waveshaperNode.curve));
    outCurveLength.set(waveshaperNode.curve.length);
}

// * onChange handlers * //
inDryWet.onChange = () =>
{
    wetNode.gain.linearRampToValueAtTime(Number(inDryWet.get()), audioContext.currentTime + 0.01);
    dryNode.gain.linearRampToValueAtTime((1 - Number(inDryWet.get())), audioContext.currentTime + 0.01);
};

inWaveshapeArray.onChange = inDistortionAmount.onChange = changeDistortion;

inOversampling.onChange = updateOversampling;

function updateOversampling()
{
    waveshaperNode.oversample = inOversampling.get();
}

inOutputGain.onChange = updateGain;

function updateGain()
{
    outputNode.gain.linearRampToValueAtTime(Number(inOutputGain.get()), audioContext.currentTime + 0.01);
}

let oldAudioIn = null;
inAudio.onChange = function ()
{
    if (!inAudio.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect)
                {
                    oldAudioIn.disconnect(inputNode);
                }
            }
            catch (e)
            {
                op.log(e);
            }
        }

        audioOut.set(null);
    }
    else
    {
        if (inAudio.get().connect)
        {
            inAudio.get().connect(inputNode);
            audioOut.set(outputNode);
            updateGain();
            updateOversampling();
        }
    }
    oldAudioIn = inAudio.get();
};
