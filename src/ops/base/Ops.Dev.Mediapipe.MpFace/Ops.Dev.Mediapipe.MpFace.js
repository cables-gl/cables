const
    inEle = op.inObject("Element"),
    outPoints = op.outArray("Points"),
    outFound = op.outNumber("Found"),
    outResult = op.outObject("Result");

// https://google.github.io/mediapipe/solutions/face_mesh.html

let camera = null;

inEle.onChange = () =>
{
    const el = inEle.get();
    if (!el) return;

    camera = new Camera(el, {
        "onFrame": async () =>
        {
            await faceMesh.send({ "image": el });
        },
        "width": el.width,
        "height": el.height
    });
    camera.start();
};

const faceMesh = new FaceMesh({ "locateFile": (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });

faceMesh.setOptions({
    "maxNumFaces": 1,
    "minDetectionConfidence": 0.5,
    "minTrackingConfidence": 0.5
});
// faceMesh.onResults(onResults);

// hands.setOptions({
//   maxNumHands: 2,
//   minDetectionConfidence: 0.5,
//   minTrackingConfidence: 0.5
// });
faceMesh.onResults((r) =>
{
    let points = [];

    if (r && r.multiFaceLandmarks)
    {
        outFound.set(r.multiFaceLandmarks.length);
        if (r.multiFaceLandmarks[0]) for (let i = 0; i < r.multiFaceLandmarks[0].length; i++)
        {
            points.push(
                (r.multiFaceLandmarks[0][i].x - 0.5) * 2,
                -1 * (r.multiFaceLandmarks[0][i].y - 0.5) * 2, 0);
        }
    }
    else outFound.set(0);

    outPoints.set(points);
    outResult.set(r);
});
