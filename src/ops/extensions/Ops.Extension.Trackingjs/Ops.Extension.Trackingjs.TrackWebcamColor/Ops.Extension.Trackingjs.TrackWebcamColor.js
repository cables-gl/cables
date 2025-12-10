const
    inUpdate = op.inTrigger("Update"),
    inEle = op.inObject("Video Element"),
    inThresh = op.inFloatSlider("Threshold", 0.5),

    inResize = op.inFloatSlider("Resize Video", 0.3),

    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),

    outArrPos = op.outArray("Positions"),
    outArrSizes = op.outArray("Sizes");

const color = { "r": 0, "g": 80, "b": 150 };
let started = false;

r.setUiAttribs({ "colorPick": true });
r.onChange =
    g.onChange =
    b.onChange = () =>
    {
        color.r = Math.round(r.get() * 255);
        color.g = Math.round(g.get() * 255);
        color.b = Math.round(b.get() * 255);
    };

let canvas = document.createElement("canvas");
const eleId = "video2canv" + CABLES.uuid();
canvas.setAttribute("id", eleId);

tracking.ColorTracker.registerColor("dynamic", function (r, g, b)
{
    return getColorDistance(color, { "r": r, "g": g, "b": b }) < inThresh.get() * 255;
});

let tracker = new tracking.ColorTracker("dynamic");
// let tracker = new tracking.ObjectTracker("face");

tracker.on("track", function (e)
{
    const arrRects = [];
    const arrSizes = [];

    const r = canvas.width / canvas.height;

    if (e.data.length !== 0)
    {
        e.data.forEach(function (rect)
        {
            arrRects.push(r * (rect.x / canvas.width - 0.5), 1.0 - rect.y / canvas.height - 0.5, 0);
            arrSizes.push(r * (rect.width / canvas.width), rect.height / canvas.height, 0);
        });
    }

    outArrPos.set(arrRects);
    outArrSizes.set(arrSizes);
});

inUpdate.onTriggered = () =>
{
    const videoEle = inEle.get();
    if (videoEle)
    {
        if (videoEle.videoWidth && videoEle.videoHeight)
        {
            let w = videoEle.videoWidth;
            let h = videoEle.videoHeight;

            w = Math.round(w * inResize.get());
            h = Math.round(h * inResize.get());

            canvas.setAttribute("width", w);
            canvas.setAttribute("height", h);

            canvas.getContext("2d", { "alpha": false }).drawImage(videoEle, 0, 0, w, h);
        }
    }

    // canvas = inCanvas.get();
    if (!started && canvas)
    {
        // started=true;
        tracking.track(canvas, tracker, { "camera": true });
    }
};

function getColorDistance(target, actual)
{
    return Math.sqrt(
        (target.r - actual.r) * (target.r - actual.r) +
        (target.g - actual.g) * (target.g - actual.g) +
        (target.b - actual.b) * (target.b - actual.b)
    );
}
