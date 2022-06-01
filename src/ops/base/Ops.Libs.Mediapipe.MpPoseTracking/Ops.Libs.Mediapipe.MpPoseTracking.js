// todo: warn if ele not dom object , e..g. texture!

const
    inEle = op.inObject("Element", null, "element"),

    inModelComplexity = op.inSwitch("Model Complexity", ["0", "1", "2"], "1"),
    inSmoothLandmarks = op.inBool("Smooth Landmarks", true),
    inEnableSegmentation = op.inBool("Enable Segmentation", true),
    inSmoothSegmentation = op.inBool("Smooth Segmentation", true),

    inMinDetectionConfidence = op.inFloatSlider("Min Detection Confidence", 0.5),
    inMinTrackingConfidence = op.inFloatSlider("Min Tracking Confidence", 0.5),

    outPoints = op.outArray("Points"),
    outLandmarks = op.outArray("Landmarks"),
    outLines = op.outArray("Lines"),
    outFound = op.outNumber("Found");

const pose = new Pose({ "locateFile": (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });

let camera = null;
let lines = [];
let points = [];
let points2 = [];

updateOptions();

inSmoothLandmarks.onChange =
    inModelComplexity.onChange =
    inEnableSegmentation.onChange =
    inSmoothSegmentation.onChange =
    inMinDetectionConfidence.onChange =
    inMinTrackingConfidence.onChange = updateOptions;

function updateOptions()
{
    pose.setOptions({
        "modelComplexity": parseInt(inModelComplexity.get()),
        "smoothLandmarks": inSmoothLandmarks.get(),
        "enableSegmentation": inEnableSegmentation.get(),
        "smoothSegmentation": inSmoothSegmentation.get(),
        "minDetectionConfidence": inMinDetectionConfidence.get(),
        "minTrackingConfidence": inMinTrackingConfidence.get()
    });
}

inEle.onChange = () =>
{
    const el = inEle.get();
    if (!el)
    {
        return;
    }
    // console.log(el)
    // op.log("init camera");
    camera = new Camera(el, {
        "onFrame": async () =>
        {
            await pose.send({ "image": el });
        },
        "width": el.width,
        "height": el.height
    });
    camera.start();
};

pose.onResults((r) =>
{
    if (r && r.poseLandmarks)
    {
        for (let i = 0; i < r.poseLandmarks.length; i++)
        {
            points[i * 3] = (r.poseLandmarks[i].x - 0.5) * 2.0;
            points[i * 3 + 1] = (r.poseLandmarks[i].y - 0.5) * -2;
            points[i * 3 + 2] = r.poseLandmarks[i].z * 1.0;
        }

        outPoints.set(null);
        outPoints.set(points);

        outLandmarks.set(r.poseLandmarks);

        lines = [];

        // top body
        lines.push(
            points[11 * 3 + 0], points[11 * 3 + 1], points[11 * 3 + 2],
            points[12 * 3 + 0], points[12 * 3 + 1], points[12 * 3 + 2]);
        lines.push(
            points[12 * 3 + 0], points[12 * 3 + 1], points[12 * 3 + 2],
            points[24 * 3 + 0], points[24 * 3 + 1], points[24 * 3 + 2]);
        lines.push(
            points[24 * 3 + 0], points[24 * 3 + 1], points[24 * 3 + 2],
            points[23 * 3 + 0], points[23 * 3 + 1], points[23 * 3 + 2]);
        lines.push(
            points[11 * 3 + 0], points[11 * 3 + 1], points[11 * 3 + 2],
            points[23 * 3 + 0], points[23 * 3 + 1], points[23 * 3 + 2]);

        // left arm
        lines.push(
            points[11 * 3 + 0], points[11 * 3 + 1], points[11 * 3 + 2],
            points[13 * 3 + 0], points[13 * 3 + 1], points[13 * 3 + 2]);
        lines.push(
            points[13 * 3 + 0], points[13 * 3 + 1], points[13 * 3 + 2],
            points[15 * 3 + 0], points[15 * 3 + 1], points[15 * 3 + 2]);

        // right arm
        lines.push(
            points[12 * 3 + 0], points[12 * 3 + 1], points[12 * 3 + 2],
            points[14 * 3 + 0], points[14 * 3 + 1], points[14 * 3 + 2]);
        lines.push(
            points[14 * 3 + 0], points[14 * 3 + 1], points[14 * 3 + 2],
            points[16 * 3 + 0], points[16 * 3 + 1], points[16 * 3 + 2]);

        // left leg
        lines.push(
            points[23 * 3 + 0], points[23 * 3 + 1], points[23 * 3 + 2],
            points[25 * 3 + 0], points[25 * 3 + 1], points[25 * 3 + 2]);
        lines.push(
            points[25 * 3 + 0], points[25 * 3 + 1], points[25 * 3 + 2],
            points[27 * 3 + 0], points[27 * 3 + 1], points[27 * 3 + 2]);
        lines.push(
            points[27 * 3 + 0], points[27 * 3 + 1], points[27 * 3 + 2],
            points[29 * 3 + 0], points[29 * 3 + 1], points[29 * 3 + 2]);

        // right leg
        lines.push(
            points[24 * 3 + 0], points[24 * 3 + 1], points[24 * 3 + 2],
            points[26 * 3 + 0], points[26 * 3 + 1], points[26 * 3 + 2]);
        lines.push(
            points[26 * 3 + 0], points[26 * 3 + 1], points[26 * 3 + 2],
            points[28 * 3 + 0], points[28 * 3 + 1], points[28 * 3 + 2]);
        lines.push(
            points[28 * 3 + 0], points[28 * 3 + 1], points[28 * 3 + 2],
            points[30 * 3 + 0], points[30 * 3 + 1], points[30 * 3 + 2]);

        // left hand
        lines.push(
            points[15 * 3 + 0], points[15 * 3 + 1], points[15 * 3 + 2],
            points[21 * 3 + 0], points[21 * 3 + 1], points[21 * 3 + 2],

            points[15 * 3 + 0], points[15 * 3 + 1], points[15 * 3 + 2],
            points[17 * 3 + 0], points[17 * 3 + 1], points[17 * 3 + 2],

            points[17 * 3 + 0], points[17 * 3 + 1], points[17 * 3 + 2],
            points[19 * 3 + 0], points[19 * 3 + 1], points[19 * 3 + 2],

            points[19 * 3 + 0], points[19 * 3 + 1], points[19 * 3 + 2],
            points[15 * 3 + 0], points[15 * 3 + 1], points[15 * 3 + 2]);

        // right hand
        lines.push(
            points[16 * 3 + 0], points[16 * 3 + 1], points[16 * 3 + 2],
            points[22 * 3 + 0], points[22 * 3 + 1], points[22 * 3 + 2],

            points[16 * 3 + 0], points[16 * 3 + 1], points[16 * 3 + 2],
            points[18 * 3 + 0], points[18 * 3 + 1], points[18 * 3 + 2],

            points[18 * 3 + 0], points[18 * 3 + 1], points[18 * 3 + 2],
            points[20 * 3 + 0], points[20 * 3 + 1], points[20 * 3 + 2],

            points[20 * 3 + 0], points[20 * 3 + 1], points[20 * 3 + 2],
            points[16 * 3 + 0], points[16 * 3 + 1], points[16 * 3 + 2]);

        lines.push(
            points[27 * 3 + 0], points[27 * 3 + 1], points[27 * 3 + 2],
            points[31 * 3 + 0], points[31 * 3 + 1], points[31 * 3 + 2],

            points[31 * 3 + 0], points[31 * 3 + 1], points[31 * 3 + 2],
            points[29 * 3 + 0], points[29 * 3 + 1], points[29 * 3 + 2]);

        lines.push(
            points[28 * 3 + 0], points[28 * 3 + 1], points[28 * 3 + 2],
            points[32 * 3 + 0], points[32 * 3 + 1], points[32 * 3 + 2],

            points[32 * 3 + 0], points[32 * 3 + 1], points[32 * 3 + 2],
            points[30 * 3 + 0], points[30 * 3 + 1], points[30 * 3 + 2]);

        outLines.set(lines);
    }
    else
    {
        outPoints.set(null);
        outLandmarks.set(null);
        outLines.set(null);
    }
});