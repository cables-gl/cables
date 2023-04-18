const cgl = op.patch.cgl;
const TEX_SIZES = ["128", "256", "512", "1024", "2048"];
const
    refresh = op.inTriggerButton("Refresh"),
    fftArr = op.inArray("FFT Array"),
    x = op.inValueSlider("X Position"),
    y = op.inValueSlider("Y Position"),
    w = op.inValueSlider("Width", 0.2),
    h = op.inValueSlider("Height", 0.2),
    drawTex = op.inValueBool("Create Texture", true),
    inCanvasSize = op.inSwitch("Texture Size", TEX_SIZES, "128"),
    texOut = op.outTexture("Texture Out", null, "texture"),
    value = op.outNumber("Area Average Volume");

op.setPortGroup("Area Settings", [x, y, w, h]);
op.setPortGroup("Texture Settings", [drawTex, inCanvasSize]);

let updateTexture = false;
inCanvasSize.onChange = () =>
{
    updateTexture = true;
};
const data = [];
const line = 0;
let size = Number(inCanvasSize.get());

const canvas = document.createElement("canvas");
canvas.id = "fft_" + CABLES.uuid();
canvas.width = canvas.height = size;
canvas.style.display = "none";
const body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const MULTIPLIERS = [0.5, 1, 2, 4, 8];
let multiplier = 1;

let areaX = 0;
let areaY = 0;
let areaW = 20;
let areaH = 20;
let amount = 0;

refresh.onTriggered = function ()
{
    const arr = fftArr.get();
    if (!arr)
    {
        return;
    }

    const width = arr.length;

    const draw = drawTex.get();

    if (updateTexture)
    {
        size = Number(inCanvasSize.get());
        canvas.width = canvas.height = size;

        const indexOfSize = TEX_SIZES.indexOf(String(inCanvasSize.get()));
        multiplier = MULTIPLIERS[indexOfSize];

        updateTexture = false;
    }

    if (draw)
    {
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#ff0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#888";
        for (let i = 0; i < arr.length; i++)
        {
            // console.log(size, i, multiplier);
            ctx.fillRect(i, size - arr[i] * multiplier, 1, arr[i] * multiplier);
        }
    }

    areaX = x.get() * canvas.width;
    areaY = y.get() * canvas.height;

    areaW = w.get() * size / 2;
    areaH = h.get() * size / 2;

    if (draw)ctx.rect(areaX, areaY, areaW, areaH);
    if (draw)
    {
        ctx.lineWidth = 2 * multiplier;
        ctx.stroke();
    }

    const val = 0;
    let count = 0;
    for (let xc = areaX; xc < areaX + areaW; xc++)
        for (let yc = areaY; yc < areaY + areaH; yc++)
            if (arr[Math.round(xc)] * multiplier > size - yc)count++;

    if (amount != amount)amount = 0;
    amount += count / (areaW * areaH);
    amount /= 2;
    value.set(amount);

    if (draw)
    {
        ctx.fillStyle = "#ff0";
        ctx.fillRect(0, 0, amount * canvas.width, 6 * multiplier);

        if (texOut.get()) texOut.get().initTexture(canvas, CGL.Texture.FILTER_NEAREST);
        else
        {
            texOut.set(new CGL.Texture.createFromImage(cgl, canvas, { "filter": CGL.Texture.FILTER_NEAREST }));
        }
    }
};
