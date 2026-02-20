const FFT_BUFFER_SIZES = [32, 64, 128, 256, 512, 1024, 2048, 4096];

let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
const analyser = audioCtx.createAnalyser();

const inAudio = op.inObject("Audio In", null, "audioNode");
const inFFTSize = op.inDropDown("Resolution", FFT_BUFFER_SIZES, 1024);
const inColor = op.inString("Color", "#7AC4E0");
const inLineWidth = op.inFloat("Width", 1.5);
const inGain = op.inFloat("Gain", 1.0);

const audioOut = op.outObject("Audio Out", null, "audioNode");

op.setUiAttrib({ "height": 120, "width": 300, "resizable": true });

let timeDataArray = new Uint8Array(analyser.frequencyBinCount);
let oldAudioIn = null;

inAudio.onChange = () =>
{
    const newNode = inAudio.get();
    if (oldAudioIn && oldAudioIn.disconnect)
    {
        try { oldAudioIn.disconnect(analyser); }
        catch (e) { op.log("Disconnect error:", e); }
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

inFFTSize.onChange = () =>
{
    analyser.fftSize = parseInt(inFFTSize.get());
    timeDataArray = new Uint8Array(analyser.frequencyBinCount);
};

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    const midY = layer.height / 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(layer.x, layer.y + midY);
    ctx.lineTo(layer.x + layer.width, layer.y + midY);
    ctx.stroke();

    if (inAudio.get())
    {
        analyser.getByteTimeDomainData(timeDataArray);

        const len = timeDataArray.length;
        if (len === 0) return;

        ctx.strokeStyle = inColor.get();
        ctx.lineWidth = inLineWidth.get();
        ctx.lineJoin = "round";
        ctx.beginPath();

        const sliceWidth = layer.width / (len - 1);
        const gain = inGain.get();

        for (let i = 0; i < len; i++)
        {
            let v = (timeDataArray[i] / 128.0) - 1.0;
            let y = layer.y + midY + (v * midY * gain);

            if (y < layer.y) y = layer.y;
            if (y > layer.y + layer.height) y = layer.y + layer.height;

            let x = layer.x + (i * sliceWidth);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
};
