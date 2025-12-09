// todo: warn if ele not dom object , e..g. texture!

const
    inEle = op.inObject("Element", null, "element"),
    inMinConfDetect = op.inFloatSlider("Min Confidence Detect", 0.5),
    inMinConfTrack = op.inFloatSlider("Min Confidence Tracking", 0.5),

    outResult = op.outObject("Result"),
    outFound = op.outNumber("Found Hands");

const hands = new Hands({ "locateFile": (file) =>
{ return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`; } });

let camera = null;
updateOptions();

inMinConfTrack.onChange =
    inMinConfDetect.onChange = updateOptions;

inEle.onChange = () =>
{
    if (!inEle.get()) return;

    camera = new Camera(inEle.get(), {
        "onFrame": async () =>
        {
            const ele = inEle.get();

            if (ele) await hands.send({ "image": ele });
        },
        "width": inEle.get().width,
        "height": inEle.get().height
    });
    camera.start();
};

function updateOptions()
{
    hands.setOptions({
        "maxNumHands": 2,
        "minDetectionConfidence": inMinConfDetect.get(),
        "minTrackingConfidence": inMinConfTrack.get()
    });
}

hands.onResults((r) =>
{
    if (r && r.multiHandedness)
    {
        outFound.set(r.multiHandedness.length);
    }
    else
    {
        outFound.set(0);
    }

    outResult.set(r);
});
