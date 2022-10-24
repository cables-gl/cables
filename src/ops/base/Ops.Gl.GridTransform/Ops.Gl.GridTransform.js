const
    render = op.inTrigger("Render"),
    numX = op.inValueInt("Num X", 5),
    numY = op.inValueInt("Num Y", 5),
    spaceX = op.inValue("Space X", 1),
    spaceY = op.inValue("Space Y", 1),
    next = op.outTrigger("Next"),
    outIndex = op.outNumber("Index"),
    outX = op.outNumber("x index"),
    outY = op.outNumber("y index");

let matOrig = mat4.create();
let vec = vec3.create();

let cgl = op.patch.cgl;

render.onTriggered = function ()
{
    cgl.pushModelMatrix();

    mat4.copy(matOrig, cgl.modelMatrix());

    let mx = spaceX.get();
    let my = spaceY.get();

    let maxX = Math.floor(numX.get());
    let maxY = Math.floor(numY.get());

    let alX = ((maxX - 1) * mx) / 2;
    let alY = ((maxY - 1) * my) / 2;

    let i = 0;
    for (let y = 0; y < maxY; y++)
    {
        outY.set(y);

        for (let x = 0; x < maxX; x++)
        {
            vec3.set(vec,
                x * mx - alX,
                y * my - alY,
                0);
            outX.set(x);
            mat4.translate(cgl.mMatrix, matOrig, vec);
            outIndex.set(i);
            i++;
            next.trigger();
        }
    }

    cgl.popModelMatrix();
};
