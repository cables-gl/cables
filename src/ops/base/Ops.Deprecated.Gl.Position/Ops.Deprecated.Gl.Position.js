const
    render = op.inTrigger("render"),
    posX = op.inValue("X", 0),
    posY = op.inValue("Y", 0),
    posZ = op.inValue("Z", 0),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("Pos X"),
    outY = op.outNumber("Pos Y"),
    outZ = op.outNumber("Pos Z");

op.setUiAxisPorts(posX, posY, posZ);

render.onTriggered = function ()
{
    outX.set(posX.get());
    outY.set(posY.get());
    outZ.set(posZ.get());

    trigger.trigger();

    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                posX,
                posY,
                posZ,
            });
};
