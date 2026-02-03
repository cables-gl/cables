const
    inUpdate = op.inTrigger("Update"),
    inHand = op.inSwitch("Handedness", ["left", "right"], "right"),
    next = op.outTrigger("Next"),

    outAxis1 = op.outNumber("Axis 1"),
    outAxis2 = op.outNumber("Axis 2"),
    outAxis3 = op.outNumber("Axis 3"),
    outAxis4 = op.outNumber("Axis 4"),
    outButton1 = op.outBoolNum("Button 1 Pressed"),
    outButton2 = op.outBoolNum("Button 2 Pressed"),
    outButton3 = op.outBoolNum("Button 3 Pressed"),
    outButton4 = op.outBoolNum("Button 4 Pressed"),
    outButton5 = op.outBoolNum("Button 5 Pressed"),
    outButton6 = op.outBoolNum("Button 6 Pressed"),
    outButton7 = op.outBoolNum("Button 7 Pressed"),
    outButton1Touch = op.outBoolNum("Button 1 Touched"),
    outButton2Touch = op.outBoolNum("Button 2 Touched"),
    outButton3Touch = op.outBoolNum("Button 3 Touched"),
    outButton4Touch = op.outBoolNum("Button 4 Touched"),
    outButton5Touch = op.outBoolNum("Button 5 Touched"),
    outButton6Touch = op.outBoolNum("Button 6 Touched"),
    outButton7Touch = op.outBoolNum("Button 7 Touched"),

    outX = op.outNumber("Position X"),
    outY = op.outNumber("Position Y"),
    outZ = op.outNumber("Position Z"),

    outGp = op.outObject("Gamepad Values"),

    outTransformed = op.outTrigger("Transformed Position"),

    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;

op.setPortGroup("Gamepad", [
    outButton1, outButton2, outButton3, outButton4, outButton5, outButton6, outButton7,
    outButton1Touch, outButton2Touch, outButton3Touch, outButton4Touch, outButton5Touch, outButton6Touch, outButton7Touch,
    outAxis1, outAxis2, outAxis3, outAxis4]);

inUpdate.onTriggered = () =>
{
    let found = false;

    if (op.patch.cgl.tempData.xrSession)
    {
        let xrSession = op.patch.cgl.tempData.xrSession;

        const inputSources = xrSession.inputSources;

        for (let i = 0; i < inputSources.length; i++)
        {
            if (inputSources[i].gamepad && !inputSources[i].hand && inputSources[i].handedness === inHand.get())
            {
                found = true;

                setGamepadValues(inputSources[i].gamepad);

                let controlPose = cgl.tempData.xrFrame.getPose(inputSources[i].gripSpace, cgl.tempData.xrReferenceSpace);
                if (controlPose && controlPose.transform)
                {
                    cgl.pushModelMatrix();

                    mat4.multiply(cgl.mMatrix, cgl.mMatrix, controlPose.transform.matrix);
                    outX.set(controlPose.transform.position.x);
                    outY.set(controlPose.transform.position.y);
                    outZ.set(controlPose.transform.position.z);

                    outTransformed.trigger();

                    cgl.popModelMatrix();
                }
                else op.log("vr controller: no controlpose transform?!");

                break;
            }
        }
    }
    else outGp.setRef(null);
    outFound.set(found);
    next.trigger();
};

function setGamepadValues(gp)
{
    outAxis1.set(gp.axes[0]);
    outAxis2.set(gp.axes[1]);

    if (gp.buttons[0])outButton1.set(gp.buttons[0].pressed);
    if (gp.buttons[1])outButton2.set(gp.buttons[1].pressed);
    if (gp.buttons[2])outButton3.set(gp.buttons[2].pressed);
    if (gp.buttons[3])outButton4.set(gp.buttons[3].pressed);
    if (gp.buttons[4])outButton5.set(gp.buttons[4].pressed);
    if (gp.buttons[5])outButton6.set(gp.buttons[5].pressed);
    if (gp.buttons[6])outButton7.set(gp.buttons[6].pressed);

    if (gp.buttons[0])outButton1Touch.set(gp.buttons[0].touched);
    if (gp.buttons[1])outButton2Touch.set(gp.buttons[1].touched);
    if (gp.buttons[2])outButton3Touch.set(gp.buttons[2].touched);
    if (gp.buttons[3])outButton4Touch.set(gp.buttons[3].touched);
    if (gp.buttons[4])outButton5Touch.set(gp.buttons[4].touched);
    if (gp.buttons[5])outButton6Touch.set(gp.buttons[5].touched);
    if (gp.buttons[6])outButton7Touch.set(gp.buttons[6].touched);

    const g = { "buttons": gp.buttons,
        "axes": gp.axes,
        "connected": gp.connected,
        "mapping": gp.mapping
    };

    outGp.setRef(g);
}
