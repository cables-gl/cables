const
    inUpdate = op.inTrigger("Update"),
    inHand = op.inSwitch("Handedness", ["left", "right"], "right"),
    next = op.outTrigger("Next"),

    outAxis1=op.outNumber("Axis 1"),
    outAxis2=op.outNumber("Axis 2"),
    outAxis3=op.outNumber("Axis 3"),
    outAxis4=op.outNumber("Axis 4"),
    outButton1=op.outNumber("Button 1 Pressed"),
    outButton2=op.outNumber("Button 2 Pressed"),
    outButton3=op.outNumber("Button 3 Pressed"),
    outButton4=op.outNumber("Button 4 Pressed"),
    outButton5=op.outNumber("Button 5 Pressed"),
    outButton6=op.outNumber("Button 6 Pressed"),
    outButton7=op.outNumber("Button 7 Pressed"),
    outButton1Touch=op.outNumber("Button 1 Touched"),
    outButton2Touch=op.outNumber("Button 2 Touched"),
    outButton3Touch=op.outNumber("Button 3 Touched"),
    outButton4Touch=op.outNumber("Button 4 Touched"),
    outButton5Touch=op.outNumber("Button 5 Touched"),
    outButton6Touch=op.outNumber("Button 6 Touched"),
    outButton7Touch=op.outNumber("Button 7 Touched"),

    outX=op.outNumber("Position X"),
    outY=op.outNumber("Position Y"),
    outZ=op.outNumber("Position Z"),

    outTransformed=op.outTrigger("Transformed Position"),

    outFound = op.outBoolNum("Found");

const cgl=op.patch.cgl;

op.setPortGroup("Gamepad",[
    outButton1,outButton2,outButton3,outButton4,outButton5,outButton6,outButton7,
    outButton1Touch,outButton2Touch,outButton3Touch,outButton4Touch,outButton5Touch,outButton6Touch,outButton7Touch,
    outAxis1,outAxis2,outAxis3,outAxis4]);

inUpdate.onTriggered = () =>
{
    if (op.patch.cgl.frameStore.xrSession)
    {
        let found = false;
        let xrSession = op.patch.cgl.frameStore.xrSession;

        const inputSources=xrSession.inputSources
        for (let i = 0; i < inputSources.length; i++)
        {
            // console.log(inputSources[i]);
            if (inputSources[i].handedness === inHand.get())
            {
                found = true;
                // primaryInputSource = inputSources[i];


                if(inputSources[i].gamepad)setGamepadValues(inputSources[i].gamepad);

        // cgl.frameStore.xrSession = xrSession;
        // cgl.frameStore.xrFrame = xrFrame;
        // cgl.frameStore.xrViewerPose = xrViewerPose;

    let controlPose = cgl.frameStore.xrFrame.getPose(inputSources[i].gripSpace, cgl.frameStore.xrReferenceSpace);
    // console.log(controlPose);



    cgl.pushModelMatrix();
    // mat4.identity(cgl.mMatrix);
    mat4.multiply(cgl.mMatrix, cgl.mMatrix, controlPose.transform.matrix);
    outX.set(controlPose.transform.position.x);
    outY.set(controlPose.transform.position.y);
    outZ.set(controlPose.transform.position.z);

    outTransformed.trigger();

    cgl.popModelMatrix();



                break;
            }
        }

        outFound.set(found);
    }

    next.trigger();
};

function setGamepadValues(gp)
{
    outAxis1.set(gp.axes[0]);
    outAxis2.set(gp.axes[1]);

    outButton1.set(gp.buttons[0].pressed);
    outButton2.set(gp.buttons[1].pressed);
    outButton3.set(gp.buttons[2].pressed);

    outButton1Touch.set(gp.buttons[0].touched);
    outButton2Touch.set(gp.buttons[1].touched);
    outButton3Touch.set(gp.buttons[2].touched);

}