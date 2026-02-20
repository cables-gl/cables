const FFT_BUFFER_SIZES = [32, 64, 128, 256, 512, 1024, 2048];

let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
const analyser = audioCtx.createAnalyser();

const inAudio = op.inObject("Audio In", null, "audioNode");
const inFFTSize = op.inDropDown("Resolution", FFT_BUFFER_SIZES, 256);
const inSmoothing = op.inFloatSlider("Smoothing", 0.8);
const inColor = op.inString("Color", "#7AC4E0");
const inStyle = op.inBool("Curve style", true);
const inGrid = op.inBool("Display Grid", true);

const audioOut = op.outObject("Audio Out", null, "audioNode");

op.setUiAttrib({ "height": 120, "width": 300, "resizable": true });

let fftDataArray = new Uint8Array(analyser.frequencyBinCount);
let oldAudioIn = null;

inAudio.onChange = () =>
{
    const newNode = inAudio.get();
    if (oldAudioIn && oldAudioIn.disconnect)
    {
        try { oldAudioIn.disconnect(analyser); }
        catch (e) { op.log(e); }
    }
    if (newNode && newNode.connect)
    {
        newNode.connect(analyser);
        audioOut.set(analyser);
    }
    else
    {
        audioOut.set(null);
    }
    oldAudioIn = newNode;
};

const updateSettings = () =>
{
    analyser.fftSize = parseInt(inFFTSize.get());
    analyser.smoothingTimeConstant = Math.max(0, Math.min(1, inSmoothing.get()));
    fftDataArray = new Uint8Array(analyser.frequencyBinCount);
};

inFFTSize.onChange = inSmoothing.onChange = updateSettings;

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    if (inGrid.get())
    {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#333";
        ctx.beginPath();

        const numVDivs = 10;
        for (let i = 1; i < numVDivs; i++)
        {
            let x = layer.x + (layer.width / numVDivs) * i;
            ctx.moveTo(x, layer.y);
            ctx.lineTo(x, layer.y + layer.height);
        }

        const numHDivs = 4;
        for (let i = 1; i < numHDivs; i++)
        {
            let y = layer.y + (layer.height / numHDivs) * i;
            ctx.moveTo(layer.x, y);
            ctx.lineTo(layer.x + layer.width, y);
        }
        ctx.stroke();
    }

    if (!inAudio.get()) return;

    analyser.getByteFrequencyData(fftDataArray);
    const len = fftDataArray.length;

    ctx.strokeStyle = inColor.get();
    ctx.fillStyle = inColor.get();
    ctx.lineWidth = 1.5;
    const barWidth = layer.width / len;

    if (inStyle.get())
    {
        ctx.beginPath();
        for (let i = 0; i < len; i++)
        {
            let val = fftDataArray[i] / 255;
            let x = layer.x + (i * barWidth);
            let y = layer.y + layer.height - (val * layer.height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    else
    {
        for (let i = 0; i < len; i++)
        {
            let val = fftDataArray[i] / 255;
            let h = val * layer.height;
            ctx.fillRect(layer.x + (i * barWidth), layer.y + layer.height - h, Math.max(1, barWidth - 1), h);
        }
    }
};
