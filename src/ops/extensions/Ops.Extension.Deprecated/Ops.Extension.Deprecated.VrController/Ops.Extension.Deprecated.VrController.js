const
    inexec = op.inTrigger("update"),
    inGamepad = op.inObject("Controller"),
    next = op.outTrigger("Next"),
    outvalid = op.outNumber("Valid"),
    outPosX = op.outNumber("Pos X"),
    outPosY = op.outNumber("Pos Y"),
    outPosZ = op.outNumber("Pos Z");
inexec.onTriggered = update;

function update()
{
    const gp = inGamepad.get();

    if (!gp)
    {
        outvalid.set(false);
        return;
    }
    if (!gp.pose)
    {
        outvalid.set(false);
        return;
    }

    outvalid.set(true);

    outPosX.set(gp.pose.position[0]);
    outPosY.set(gp.pose.position[1]);
    outPosZ.set(gp.pose.position[2]);

    next.trigger();
}
