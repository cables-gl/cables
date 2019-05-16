// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html

const inButton = op.inTriggerButton("Press me");
const inTexture = op.inTexture("texture");
const inZValue = op.inValueFloat("z", 0);

const faceOutline = op.outArray("Face Outline");
const rightEyebrow = op.outArray("Right Eyebrow");
const leftEyebrow = op.outArray("Left Eyebrow");
const leftEye = op.outArray("Left Eye");
const leftPupil = op.outArray("Left Pupil");
const rightEye = op.outArray("Right Eye");
const rightPupil = op.outArray("Right Pupil");
const noseLine = op.outArray("Nose Line");
const noseShape = op.outArray("Nose Shape");
const lipsOuter = op.outArray("Lips Outer");
const lipsInner = op.outArray("Lips Inner");
const outPositions = op.outArray("Positions 2D");
const outScore = op.outValue("Score");


var started=false;

let canvas = op.patch.cgl.canvas;
let ctracker = new clm.tracker({stopOnConvergence: true, scoreThreshold: 0.20});
ctracker.init();

let mapPostion = function (position) {

    if(!inTexture.get())return;

    let input_start = 0;
    let input_end_x = inTexture.get().width;
    let input_end_y = inTexture.get().height;

    let output_start = 1;
    let output_end = -1;

    let input_range_x = input_end_x - input_start;
    let input_range_y = input_end_y - input_start;
    let output_range = output_end - output_start;

     return [
        (position[0] - input_start) * output_range / input_range_y + output_start,
        (position[1] - input_start) * output_range / input_range_x + output_start,
        inZValue.get()
    ];
};

op.onDelete=function()
{
    ctracker.stop();
};

let update = function () {

    let textureInput = inTexture.get();
    if(!textureInput)return;
    let image = textureInput.videoElement||textureInput.image;

    if(!image)return;
    if(!started)
    {
        ctracker.start(image);
        started=true;
    }
    outScore.set(ctracker.getScore());

    let positions = ctracker.getCurrentPosition();


    if (positions) {

        faceOutline.set(null);

        faceOutline.set([
            mapPostion(positions[0]),
            mapPostion(positions[1]),
            mapPostion(positions[2]),
            mapPostion(positions[3]),
            mapPostion(positions[4]),
            mapPostion(positions[5]),
            mapPostion(positions[6]),
            mapPostion(positions[7]),
            mapPostion(positions[8]),
            mapPostion(positions[9]),
            mapPostion(positions[10]),
            mapPostion(positions[11]),
            mapPostion(positions[12]),
            mapPostion(positions[13]),
            mapPostion(positions[14])
        ].reverse().flat());

        rightEyebrow.set([
            mapPostion(positions[18]),
            mapPostion(positions[17]),
            mapPostion(positions[16]),
            mapPostion(positions[15])
        ].flat());
        leftEyebrow.set([
            mapPostion(positions[19]),
            mapPostion(positions[20]),
            mapPostion(positions[21]),
            mapPostion(positions[22])
        ].flat());

        leftEye.set([
            mapPostion(positions[23]),
            mapPostion(positions[63]),
            mapPostion(positions[24]),
            mapPostion(positions[64]),
            mapPostion(positions[25]),
            mapPostion(positions[65]),
            mapPostion(positions[26]),
            mapPostion(positions[66])
        ].flat());
        leftPupil.set([
            mapPostion(positions[27])
        ].flat());

        rightEye.set([
            mapPostion(positions[30]),
            mapPostion(positions[68]),
            mapPostion(positions[29]),
            mapPostion(positions[67]),
            mapPostion(positions[28]),
            mapPostion(positions[70]),
            mapPostion(positions[31]),
            mapPostion(positions[69])
        ].flat());
        rightPupil.set([
            mapPostion(positions[32])
        ].flat());

        noseLine.set([
            mapPostion(positions[33]),
            mapPostion(positions[41]),
            mapPostion(positions[62])
        ].flat());

        noseShape.set([
            mapPostion(positions[34]),
            mapPostion(positions[35]),
            mapPostion(positions[36]),
            mapPostion(positions[42]),
            mapPostion(positions[37]),
            mapPostion(positions[43]),
            mapPostion(positions[38]),
            mapPostion(positions[39]),
            mapPostion(positions[40])
        ].flat());

        lipsOuter.set([
            mapPostion(positions[44]),
            mapPostion(positions[45]),
            mapPostion(positions[46]),
            mapPostion(positions[47]),
            mapPostion(positions[48]),
            mapPostion(positions[49]),
            mapPostion(positions[50]),
            mapPostion(positions[51]),
            mapPostion(positions[52]),
            mapPostion(positions[53]),
            mapPostion(positions[54]),
            mapPostion(positions[55])
        ].flat());

        lipsInner.set([
            mapPostion(positions[44]),
            mapPostion(positions[61]),
            mapPostion(positions[60]),
            mapPostion(positions[59]),
            mapPostion(positions[50]),
            mapPostion(positions[58]),
            mapPostion(positions[57]),
            mapPostion(positions[56])
        ].flat());

        outPositions.set(positions.flat());
    }
};

inButton.onTriggered = update;
