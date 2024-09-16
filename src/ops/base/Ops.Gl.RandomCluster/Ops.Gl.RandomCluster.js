const
    exe = op.inTrigger("exe"),
    num = op.inValueInt("num"),
    seed = op.inValueFloat("random seed", 1.5),
    round = op.inValueBool("round", false),
    size = op.inValueFloat("size", 10),
    scaleX = op.inValueFloat("scaleX", 1),
    scaleY = op.inValueFloat("scaleY", 1),
    scaleZ = op.inValueFloat("scaleZ", 1),
    trigger = op.outTrigger("trigger"),
    idx = op.outNumber("index"),
    rnd = op.outNumber("rnd"),
    rotX = op.inValueSlider("Rotate X", 1),
    rotY = op.inValueSlider("Rotate Y", 1),
    rotZ = op.inValueSlider("Rotate Z", 1),
    scrollX = op.inValue("Scroll X", 0);

op.setPortGroup("Area", [size, scaleX, scaleY, scaleZ]);
op.setPortGroup("Rotation", [rotX, rotY, rotZ]);
op.setPortGroup("Parameters", [num, round, seed]);
op.toWorkPortsNeedToBeLinked(exe, trigger);

const randoms = [];
const origRandoms = [];
const randomsRot = [];
const randomsFloats = [];

const transVec = vec3.create();
const mat = mat4.create();

seed.onChange =
    num.onChange =
    size.onChange =
    scaleX.onChange =
    scaleZ.onChange =
    scaleY.onChange =
    round.onChange =
    rotX.onChange =
    rotY.onChange =
    rotZ.onChange = reset;

num.set(100);

function doRender()
{
    const cgl = op.patch.cg || op.patch.cgl;

    if (cgl.shouldDrawHelpers(op))
    {
        CABLES.GL_MARKER.drawCube(op,
            size.get() / 2 * scaleX.get(),
            size.get() / 2 * scaleY.get(),
            size.get() / 2 * scaleZ.get());
    }

    if (scrollX.get() != 0)
    {
        for (let i = 0; i < origRandoms.length; i++)
        {
            randoms[i][0] = origRandoms[i][0] + scrollX.get();
            randoms[i][0] = (randoms[i][0] % size.get()) - (size.get() / 2);
        }
    }

    for (let i = 0; i < randoms.length; i++)
    {
        cgl.pushModelMatrix();

        mat4.translate(cgl.mMatrix, cgl.mMatrix, randoms[i]);

        if (randomsRot[i][0]) mat4.rotateX(cgl.mMatrix, cgl.mMatrix, randomsRot[i][0]);
        if (randomsRot[i][1]) mat4.rotateY(cgl.mMatrix, cgl.mMatrix, randomsRot[i][1]);
        if (randomsRot[i][2]) mat4.rotateZ(cgl.mMatrix, cgl.mMatrix, randomsRot[i][2]);

        idx.set(i);
        rnd.set(randomsFloats[i]);

        trigger.trigger();
        // op.patch.instancing.increment();

        cgl.popModelMatrix();
    }
    // op.patch.instancing.popLoop();
}

exe.onTriggered = doRender;

function getRandomPos()
{
    return vec3.fromValues(
        scaleX.get() * (Math.seededRandom() - 0.5) * size.get(),
        scaleY.get() * (Math.seededRandom() - 0.5) * size.get(),
        scaleZ.get() * (Math.seededRandom() - 0.5) * size.get()
    );
}

function reset()
{
    randoms.length = 0;
    randomsRot.length = 0;
    randomsFloats.length = 0;
    origRandoms.length = 0;

    Math.randomSeed = seed.get();

    const makeRound = round.get();

    for (let i = 0; i < num.get(); i++)
    {
        randomsFloats.push(Math.seededRandom());

        let v = getRandomPos();

        if (makeRound && size.get() > 0)
            while (vec3.len(v) > size.get() / 2)
                v = getRandomPos();

        origRandoms.push([v[0], v[1], v[2]]);
        randoms.push(v);

        randomsRot.push(vec3.fromValues(
            Math.seededRandom() * 360 * CGL.DEG2RAD * rotX.get(),
            Math.seededRandom() * 360 * CGL.DEG2RAD * rotY.get(),
            Math.seededRandom() * 360 * CGL.DEG2RAD * rotZ.get()
        ));
    }
}
