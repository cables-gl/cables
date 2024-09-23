const
    exe = op.inTrigger("Exe"),
    maxDepth = op.inValue("max Depth", 4),
    deeper = op.inValueSlider("Possibility", 0.5),
    seed = op.inValue("Seed", 1),
    inScale = op.inValueSlider("Scale", 1),
    width = op.inValue("Width", 4),
    height = op.inValue("Height", 3),
    outPosArr = op.outArray("Positions"),
    outScaleArr = op.outArray("Scalings"),
    outArrayLength = op.outNumber("Array Length"),
    outArrayPoints = op.outNumber("Total Points");

const cgl = op.patch.cgl;
let needsChange = true;
let globalScale = 1;
let vPos = vec3.create();
let vScale = vec3.create();
let hhalf = 0;
let whalf = 0;
let index = 0;
let arrPos = [];
let arrScale = [];

let count = 0;

maxDepth.onChange =
    deeper.onChange =
        seed.onChange =
            inScale.onChange =
                width.onChange =
                    height.onChange =
                        function ()
                        {
                            needsChange = true;
                        };

function drawSquare(x, y, depth, scale)
{
    let godeeper = Math.seededRandom() > deeper.get() * 0.9;

    if (depth > maxDepth.get())godeeper = false;

    if (godeeper)
    {
        depth++;
        let st = 1 / (depth * depth);

        for (let _x = 0; _x < 2; _x++)
        {
            for (let _y = 0; _y < 2; _y++)
            {
                let xx = _x * scale / 2;
                let yy = _y * scale / 2;

                drawSquare(
                    x + xx - scale / 4,
                    y + yy - scale / 4,
                    depth,
                    scale / 2 * globalScale);
            }
        }
    }
    else
    {
        vec3.set(vScale, scale, scale, scale);
        vec3.set(vPos, x - whalf + 0.5, y - hhalf + 0.5, 0);
        index++;

        arrPos[count * 3 + 0] = vPos[0];
        arrPos[count * 3 + 1] = vPos[1];
        arrPos[count * 3 + 2] = vPos[2];

        arrScale[count * 3 + 0] = vScale[0];
        arrScale[count * 3 + 1] = vScale[1];
        arrScale[count * 3 + 2] = vScale[2];

        count++;
    }
}

exe.onTriggered = function ()
{
    if (!needsChange) return;

    needsChange = false;
    index = 0;
    Math.randomSeed = seed.get();

    whalf = width.get() / 2;
    hhalf = height.get() / 2;

    globalScale = inScale.get();

    arrPos.length = 0;
    arrScale.length = 0;
    count = 0;

    for (let x = 0; x < width.get(); x++)
    {
        for (let y = 0; y < height.get(); y++)
        {
            drawSquare(x, y, 0, globalScale);
            let sc = 1;
        }
    }

    outArrayLength.set(arrPos.length);
    outArrayPoints.set(arrPos.length / 3);

    outPosArr.setRef(arrPos);
    outScaleArr.setRef(arrScale);
};
