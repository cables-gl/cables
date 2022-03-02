const
    inExec = op.inTrigger("Update"),
    inFilter = op.inString("Filter", ""),
    inTime = op.inFloat("Time", 0),
    inOffset = op.inFloat("Offset", 0),
    inAmplitude = op.inFloat("Amplitude", 10),
    axisX = op.inFloatSlider("Axis X", 1.0),
    axisY = op.inFloatSlider("Axis Y", 1.0),
    axisZ = op.inFloatSlider("Axis Z", 1.0),
    next = op.outTrigger("Next"),
    outNum = op.outNumber("Found");

const cgl = op.patch.cgl;

inExec.onTriggered = function ()
{
    if (!cgl.frameStore.currentScene) return;

    let node = null;

    const ampl = inAmplitude.get();
    const offs = inOffset.get();
    const time = inTime.get();
    const ax = axisX.get();
    const ay = axisY.get();
    const az = axisZ.get();

    Math.randomSeed = 5711;
    let found = 0;

    for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
    {
        if (cgl.frameStore.currentScene.nodes[i].name.indexOf(inFilter.get()) >= 0)
        {
            node = cgl.frameStore.currentScene.nodes[i];

            found++;

            const v = Math.sin(time + (Math.seededRandom() * offs)) * ampl;
            node.addTranslate = [v * ax, v * ay, v * az];
        }
    }

    outNum.set(found);

    next.trigger();
};
