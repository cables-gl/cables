// todo: warn if ele not dom object , e..g. texture!

const
    inEle = op.inObject("Element", null, "element"),
    inMinConfDetect = op.inFloatSlider("Min Confidence Detect", 0.5),
    inMinConfTrack = op.inFloatSlider("Min Confidence Tracking", 0.5),

    outResult = op.outObject("Result"),
    outFound = op.outNumber("Found Hands");

const hands = new Hands({ "locateFile": (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}` });

let camera = null;
updateOptions();

inMinConfTrack.onChange =
    inMinConfDetect.onChange = updateOptions;

inEle.onChange = () =>
{
    if (!inEle.get()) return;

    // if(inEle.get())
    // console.log(inEle.get().videoWidth,inEle.get().videoHeight);

    // op.log("init camera");
    camera = new Camera(inEle.get(), {
        "onFrame": async () =>
        {
            const ele = inEle.get();

            if (ele) await hands.send({ "image": ele });
        },
        "width": inEle.get().videoWidth,
        "height": inEle.get().videoHeight
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
    // let points = [];
    // let points2 = [];
    // let lines = null;
    // let lines2 = null;

    if (r && r.multiHandedness)
    {
        outFound.set(r.multiHandedness.length);
    }
    else
    {
        outFound.set(0);
    }

    // // console.log(r);

    // if (r && r.multiHandLandmarks && r.multiHandLandmarks[0])
    // {
    //     for (let i = 0; i < r.multiHandLandmarks[0].length; i++)
    //     {
    //         points[i * 3] = (r.multiHandLandmarks[0][i].x - 0.5) * 2.0 * 1.3333;
    //         points[i * 3 + 1] = -1 * (r.multiHandLandmarks[0][i].y - 0.5) * 2.0;
    //         points[i * 3 + 2] = 0;
    //     }
    //     lines = getLines(points);

    //     outPoints.set(points);
    //     outLines.set(lines);
    // }
    // else
    // {
    //     outPoints.set(null);
    //     outLines.set(null);
    // }

    // if (r && r.multiHandLandmarks && r.multiHandLandmarks[1])
    // {
    //     for (let i = 0; i < r.multiHandLandmarks[1].length; i++)
    //     {
    //         points2[i * 3] = (r.multiHandLandmarks[1][i].x - 0.5) * 2.0 * 1.3333;
    //         points2[i * 3 + 1] = -1 * (r.multiHandLandmarks[1][i].y - 0.5) * 2.0;
    //         points2[i * 3 + 2] = 0;
    //     }
    //     lines2 = getLines(points2);

    //     outPoints2.set(points2);
    //     outLines2.set(lines2);
    // }
    // else
    // {
    //     outPoints2.set(null);
    //     outLines2.set(null);
    // }

    outResult.set(r);
});
