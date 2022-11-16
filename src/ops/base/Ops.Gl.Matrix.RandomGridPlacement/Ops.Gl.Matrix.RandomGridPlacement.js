const
    exe = op.inTrigger("Exe"),
    maxDepth = op.inValue("max Depth", 4),
    deeper = op.inValueSlider("Possibility"),
    seed = op.inValue("Seed", 1),
    inScale = op.inValueSlider("Scale", 1),
    width = op.inValue("Width", 4),
    height = op.inValue("Height", 3),
    next = op.outTrigger("Next"),
    outIndex = op.outNumber("Index"),
    outDepth = op.outNumber("depth");

const cgl = op.patch.cgl;
let globalScale = 1;
let vPos = vec3.create();
let vScale = vec3.create();
let hhalf = 0;
let whalf = 0;
let index = 0;

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
        cgl.pushModelMatrix();
        vec3.set(vScale, scale, scale, scale);
        vec3.set(vPos, x - whalf + 0.5, y - hhalf + 0.5, 0);
        index++;
        outIndex.set(index);
        outDepth.set(depth);

        mat4.translate(cgl.mMatrix, cgl.mMatrix, vPos);
        mat4.scale(cgl.mMatrix, cgl.mMatrix, vScale);
        next.trigger();

        cgl.popModelMatrix();
    }
}

exe.onTriggered = function ()
{
    index = 0;
    Math.randomSeed = seed.get();

    whalf = width.get() / 2;
    hhalf = height.get() / 2;

    globalScale = inScale.get();

    for (let x = 0; x < width.get(); x++)
    {
        for (let y = 0; y < height.get(); y++)
        {
            drawSquare(x, y, 0, globalScale);
            let sc = 1;
        }
    }
};
