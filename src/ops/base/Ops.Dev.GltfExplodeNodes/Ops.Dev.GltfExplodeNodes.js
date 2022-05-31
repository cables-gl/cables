const
    inExec = op.inTrigger("Update"),
    inFilter = op.inString("Filter", ""),

    inSeed = op.inFloat("Seed", 5711.0),

    axisX = op.inFloat("Axis X", 0.0),
    axisY = op.inFloat("Axis Y", 0.0),
    axisZ = op.inFloat("Axis Z", 0.0),

    rotationX = op.inFloat("Rotation X", 0.0),
    rotationY = op.inFloat("Rotation Y", 0.0),
    rotationZ = op.inFloat("Rotation Z", 0.0),

    pivotOffsetX = op.inFloat("Random Pivot Offset X", 0.0),
    pivotOffsetY = op.inFloat("Random Pivot Offset Y", 0.0),
    pivotOffsetZ = op.inFloat("Random Pivot Offset Z", 0.0),

    next = op.outTrigger("Next"),
    outNum = op.outNumber("Found");

const cgl = op.patch.cgl;

const mat = mat4.create();

inExec.onTriggered = function ()
{
    if (!cgl.frameStore.currentScene) return;

    let node = null;

    const ax = axisX.get();
    const ay = axisY.get();
    const az = axisZ.get();

    Math.randomSeed = inSeed.get();
    let found = 0;

    for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
    {
        if (cgl.frameStore.currentScene.nodes[i].name.indexOf(inFilter.get()) >= 0)
        {
            node = cgl.frameStore.currentScene.nodes[i];

            found++;

            const oldTrans = vec3.create();

            mat4.getTranslation(oldTrans, node.mat);

            // console.log(oldTrans);

            // const v = Math.sin(time + (Math.seededRandom() * offs)) * ampl;
            // node.addTranslate = [v * ax, v * ay, v * az];
            node.addTranslate = [oldTrans[0] * axisX.get(), oldTrans[1] * axisY.get(), oldTrans[2] * axisZ.get()];

            mat4.identity(mat);
            mat4.rotateX(mat, mat, rotationX.get() * (Math.seededRandom() * 301) * CGL.DEG2RAD);
            mat4.rotateY(mat, mat, rotationY.get() * (Math.seededRandom() * 301) * CGL.DEG2RAD);
            mat4.rotateZ(mat, mat, rotationZ.get() * (Math.seededRandom() * 301) * CGL.DEG2RAD);

            mat4.translate(mat, mat, [(Math.seededRandom() - 0.5) * pivotOffsetX.get(), (Math.seededRandom() - 0.5) * pivotOffsetY.get(), (Math.seededRandom() - 0.5) * pivotOffsetZ.get()]);

            node.addMulMat = mat;
        }
    }

    outNum.set(found);

    next.trigger();
};
