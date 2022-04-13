const
    render = op.inTrigger("render"),
    cameraType = op.inSwitch("Camera Type", ["Perspective", "Orthographic"], "Perspective"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    outRightX = op.outNumber("Right X"),
    outRightY = op.outNumber("Right Y"),
    outRightZ = op.outNumber("Right Z"),
    outUpX = op.outNumber("Up X"),
    outUpY = op.outNumber("Up Y"),
    outUpZ = op.outNumber("Up Z"),
    outForwardX = op.outNumber("Forward X"),
    outForwardY = op.outNumber("Forward Y"),
    outForwardZ = op.outNumber("Forward Z"),
    outNear = op.outNumber("Near Frustum"),
    outFar = op.outNumber("Far Frustum"),
    outTop = op.outNumber("Bottom Frustum"),
    outBottom = op.outNumber("Top Frustum"),
    outLeft = op.outNumber("Left Frustum"),
    outRight = op.outNumber("Right Frustum"),
    outFov = op.outNumber("FOV"),
    outAspect = op.outNumber("Aspect Ratio");
const
    cgl = op.patch.cgl,
    pos = vec3.create(),
    identVec = vec3.create(),
    iViewMatrix = mat4.create();
render.onTriggered = update;

function update()
{
    mat4.invert(iViewMatrix, cgl.vMatrix);

    outRightX.set(iViewMatrix[0]);
    outRightY.set(iViewMatrix[1]);
    outRightZ.set(iViewMatrix[2]);

    outUpX.set(iViewMatrix[4]);
    outUpY.set(iViewMatrix[5]);
    outUpZ.set(iViewMatrix[6]);

    outForwardX.set(iViewMatrix[8]);
    outForwardY.set(iViewMatrix[9]);
    outForwardZ.set(iViewMatrix[10]);

    outX.set(iViewMatrix[12]);
    outY.set(iViewMatrix[13]);
    outZ.set(iViewMatrix[14]);

    // https://stackoverflow.com/questions/10830293/decompose-projection-matrix44-to-left-right-bottom-top-near-and-far-boundary/10836497#10836497
    const m11 = cgl.pMatrix[4 * 0 + 0];
    const m13 = cgl.pMatrix[4 * 2 + 0];
    const m14 = cgl.pMatrix[4 * 3 + 0];
    const m22 = cgl.pMatrix[4 * 1 + 1];
    const m23 = cgl.pMatrix[4 * 2 + 1];
    const m24 = cgl.pMatrix[4 * 3 + 1];
    const m33 = cgl.pMatrix[4 * 2 + 2];
    const m34 = cgl.pMatrix[4 * 3 + 2];

    // https://stackoverflow.com/questions/46182845/field-of-view-aspect-ratio-view-matrix-from-projection-matrix-hmd-ost-calib
    const FOV = 2 * Math.atan(1 / m22) * 180 / Math.PI;
    const aspectRatio = m22 / m11;

    outFov.set(FOV);
    outAspect.set(aspectRatio);
    if (cameraType.get() === "Perspective")
    {
        const near = m34 / (m33 - 1);
        const far = m34 / (m33 + 1);
        const top = near * (m23 + 1) / m22;
        const bottom = near * (m23 - 1) / m22;
        const left = near * (m13 - 1) / m11;
        const right = near * (m13 + 1) / m11;

        outNear.set(near);
        outFar.set(far);
        outTop.set(top);
        outBottom.set(bottom);
        outLeft.set(left);
        outRight.set(right);
    }
    else if (cameraType.get() === "Orthographic")
    {
        const near = (1 + m34) / m33;
        const far = -(1 - m34) / m33;
        const bottom = near * (m23 - 1) / m22;
        const top = near * (m23 + 1) / m22;
        const left = near * (m13 - 1) / m11;
        const right = near * (m13 + 1) / m11;

        outNear.set(near);
        outFar.set(far);
        outTop.set(top);
        outBottom.set(bottom);
        outLeft.set(left);
        outRight.set(right);
    }

    trigger.trigger();
}
