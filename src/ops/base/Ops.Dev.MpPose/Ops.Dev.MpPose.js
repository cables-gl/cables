// todo: warn if ele not dom object , e..g. texture!

const
    inEle = op.inObject("Element"),
    outPoints = op.outArray("Points"),
    outLandmarks = op.outArray("Landmarks"),
    outLines=op.outArray("Lines"),
    outFound = op.outNumber("Found");

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

let camera = null;

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});


inEle.onChange = () =>
{
    if (!inEle.get())
    {
        return;
    }

    // op.log("init camera");
    camera = new Camera(inEle.get(), {
        "onFrame": async () =>
        {
            await pose.send({ "image": inEle.get() });
        },
        "width": 640,
        "height": 480
    });
    camera.start();
};


let lines = [];
    let points = [];
    let points2 = [];

pose.onResults((r) =>
{

    if (r && r.poseLandmarks )
    {
        for (let i = 0; i < r.poseLandmarks.length; i++)
        {
            points[i * 3] = (r.poseLandmarks[i].x - 0.5) * 4.0*1.1;
            points[i * 3 + 1] =  (r.poseLandmarks[i].y - 0.5)*-4 ;
            points[i * 3 + 2] = r.poseLandmarks[i].z*1.0;
        }

outPoints.set(null);
        outPoints.set(points);

        outLandmarks.set(r.poseLandmarks);

lines=[];

// top body
lines.push(
        points[11*3+0],points[11*3+1],points[11*3+2],
        points[12*3+0],points[12*3+1],points[12*3+2]);
lines.push(
        points[12*3+0],points[12*3+1],points[12*3+2],
        points[24*3+0],points[24*3+1],points[24*3+2]);
lines.push(
        points[24*3+0],points[24*3+1],points[24*3+2],
        points[23*3+0],points[23*3+1],points[23*3+2]);
lines.push(
        points[11*3+0],points[11*3+1],points[11*3+2],
        points[23*3+0],points[23*3+1],points[23*3+2]);

// left arm
lines.push(
        points[11*3+0],points[11*3+1],points[11*3+2],
        points[13*3+0],points[13*3+1],points[13*3+2]);
lines.push(
        points[13*3+0],points[13*3+1],points[13*3+2],
        points[15*3+0],points[15*3+1],points[15*3+2]);

// right arm
lines.push(
        points[12*3+0],points[12*3+1],points[12*3+2],
        points[14*3+0],points[14*3+1],points[14*3+2]);
lines.push(
        points[14*3+0],points[14*3+1],points[14*3+2],
        points[16*3+0],points[16*3+1],points[16*3+2]);

// left leg
lines.push(
        points[23*3+0],points[23*3+1],points[23*3+2],
        points[25*3+0],points[25*3+1],points[25*3+2]);
lines.push(
        points[25*3+0],points[25*3+1],points[25*3+2],
        points[27*3+0],points[27*3+1],points[27*3+2]);
lines.push(
        points[27*3+0],points[27*3+1],points[27*3+2],
        points[29*3+0],points[29*3+1],points[29*3+2]);

// right leg
lines.push(
        points[24*3+0],points[24*3+1],points[24*3+2],
        points[26*3+0],points[26*3+1],points[26*3+2]);
lines.push(
        points[26*3+0],points[26*3+1],points[26*3+2],
        points[28*3+0],points[28*3+1],points[28*3+2]);
lines.push(
        points[28*3+0],points[28*3+1],points[28*3+2],
        points[30*3+0],points[30*3+1],points[30*3+2]);


// left hand
lines.push(
        points[15*3+0],points[15*3+1],points[15*3+2],
        points[21*3+0],points[21*3+1],points[21*3+2],

        points[15*3+0],points[15*3+1],points[15*3+2],
        points[17*3+0],points[17*3+1],points[17*3+2],

        points[17*3+0],points[17*3+1],points[17*3+2],
        points[19*3+0],points[19*3+1],points[19*3+2],

        points[19*3+0],points[19*3+1],points[19*3+2],
        points[15*3+0],points[15*3+1],points[15*3+2]);

// right hand
lines.push(
        points[16*3+0],points[16*3+1],points[16*3+2],
        points[22*3+0],points[22*3+1],points[22*3+2],

        points[16*3+0],points[16*3+1],points[16*3+2],
        points[18*3+0],points[18*3+1],points[18*3+2],

        points[18*3+0],points[18*3+1],points[18*3+2],
        points[20*3+0],points[20*3+1],points[20*3+2],

        points[20*3+0],points[20*3+1],points[20*3+2],
        points[16*3+0],points[16*3+1],points[16*3+2]);


lines.push(
        points[27*3+0],points[27*3+1],points[27*3+2],
        points[31*3+0],points[31*3+1],points[31*3+2],

        points[31*3+0],points[31*3+1],points[31*3+2],
        points[29*3+0],points[29*3+1],points[29*3+2]);

lines.push(
        points[28*3+0],points[28*3+1],points[28*3+2],
        points[32*3+0],points[32*3+1],points[32*3+2],

        points[32*3+0],points[32*3+1],points[32*3+2],
        points[30*3+0],points[30*3+1],points[30*3+2]);


outLines.set(lines);
    }
    else
    {
        outPoints.set(null);
        outLandmarks.set(null);
        outLines.set(null);
    }



});
