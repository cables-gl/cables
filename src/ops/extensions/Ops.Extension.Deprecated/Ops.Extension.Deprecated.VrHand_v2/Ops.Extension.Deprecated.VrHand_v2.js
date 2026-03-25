const
    inUpdate = op.inTrigger("Update"),
    inHand = op.inSwitch("Handedness", ["left", "right"], "right"),
    next = op.outTrigger("Next"),

    outX = op.outNumber("Position X"),
    outY = op.outNumber("Position Y"),
    outZ = op.outNumber("Position Z"),

    outClicked = op.outTrigger("click"),

    outGp = op.outObject("Hand Object"),
    outBones = op.outArray("Bones"),
    outIndexRay = op.outArray("Index Ray"),
    outWristRay = op.outArray("Wrist Ray"),

    outTransformed = op.outTrigger("Transformed Position"),

    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;
let wasClicked = false;

inHand.onChange = updateUi;
updateUi();

const bones = [

    ["wrist", "thumb-metacarpal"],
    ["thumb-metacarpal", "thumb-phalanx-proximal"],
    ["thumb-phalanx-proximal", "thumb-phalanx-distal"],
    ["thumb-phalanx-distal", "thumb-tip"],

    ["wrist", "index-finger-metacarpal"],
    ["index-finger-metacarpal", "index-finger-phalanx-proximal"],
    ["index-finger-phalanx-proximal", "index-finger-phalanx-intermediate"],
    ["index-finger-phalanx-intermediate", "index-finger-phalanx-distal"],
    ["index-finger-phalanx-distal", "index-finger-tip"],

    ["wrist", "middle-finger-metacarpal"],
    ["middle-finger-metacarpal", "middle-finger-phalanx-proximal"],
    ["middle-finger-phalanx-proximal", "middle-finger-phalanx-intermediate"],
    ["middle-finger-phalanx-intermediate", "middle-finger-phalanx-distal"],
    ["middle-finger-phalanx-distal", "middle-finger-tip"],

    ["wrist", "ring-finger-metacarpal"],
    ["ring-finger-metacarpal", "ring-finger-phalanx-proximal"],
    ["ring-finger-phalanx-proximal", "ring-finger-phalanx-intermediate"],
    ["ring-finger-phalanx-intermediate", "ring-finger-phalanx-distal"],
    ["ring-finger-phalanx-distal", "ring-finger-tip"],

    ["wrist", "pinky-finger-metacarpal"],
    ["pinky-finger-metacarpal", "pinky-finger-phalanx-proximal"],
    ["pinky-finger-phalanx-proximal", "pinky-finger-phalanx-intermediate"],
    ["pinky-finger-phalanx-intermediate", "pinky-finger-phalanx-distal"],
    ["pinky-finger-phalanx-distal", "pinky-finger-tip"],

];

function updateUi()
{
    op.setUiAttrib({ "extendTitle": inHand.get() });
}

function dist3dSq(a, b)
{
    const xd = b[0] - a[0];
    const yd = b[1] - a[1];
    const zd = b[2] - a[2];

    return xd * xd + yd * yd + zd * zd;
}

const boneBuffer = new Float32Array(bones.length * 6);

inUpdate.onTriggered = () =>
{
    let found = false;

    if (op.patch.cgl.tempData.xrSession && cgl.tempData.xrFrame)
    {
        let xrSession = op.patch.cgl.tempData.xrSession;

        const inputSources = xrSession.inputSources;

        for (let i = 0; i < inputSources.length; i++)
        {
            if (inputSources[i].hand && inputSources[i].handedness === inHand.get())
            {
                found = true;

                const jointPositions = {};
                for (const [jointName, jointSpace] of inputSources[i].hand)
                {
                    const pose = cgl.tempData.xrFrame.getJointPose(jointSpace, cgl.tempData.xrReferenceSpace);
                    if (!pose) continue;

                    jointPositions[jointName] = [pose.transform.position.x, pose.transform.position.y, pose.transform.position.z];
                }
                outGp.setRef(jointPositions);

                /// ///////////////////

                if (jointPositions["index-finger-phalanx-intermediate"] && jointPositions["index-finger-tip"])
                    outIndexRay.setRef(
                        [
                            jointPositions["index-finger-phalanx-intermediate"][0],
                            jointPositions["index-finger-phalanx-intermediate"][1],
                            jointPositions["index-finger-phalanx-intermediate"][2],
                            jointPositions["index-finger-tip"][0],
                            jointPositions["index-finger-tip"][1],
                            jointPositions["index-finger-tip"][2]
                        ]);

                if (jointPositions.wrist && jointPositions["index-finger-phalanx-proximal"])
                    outWristRay.setRef(
                        [
                            jointPositions.wrist[0],
                            jointPositions.wrist[1],
                            jointPositions.wrist[2],
                            jointPositions["index-finger-phalanx-proximal"][0],
                            jointPositions["index-finger-phalanx-proximal"][1],
                            jointPositions["index-finger-phalanx-proximal"][2]
                        ]);

                if (jointPositions["thumb-tip"] && jointPositions["index-finger-tip"])
                {
                    if (dist3dSq(jointPositions["thumb-tip"], jointPositions["index-finger-tip"]) < 0.0001)
                    {
                        if (!wasClicked)
                        {
                            wasClicked = true;
                            outClicked.trigger();
                        }
                    }
                    else
                    {
                        wasClicked = false;
                    }
                }

                /// ////////////////////

                let boneCount = 0;

                for (const [a, b] of bones)
                {
                    const pa = jointPositions[a];
                    const pb = jointPositions[b];
                    if (!pa || !pb) continue;

                    boneBuffer[boneCount++] = pa[0];
                    boneBuffer[boneCount++] = pa[1];
                    boneBuffer[boneCount++] = pa[2];
                    boneBuffer[boneCount++] = pb[0];
                    boneBuffer[boneCount++] = pb[1];
                    boneBuffer[boneCount++] = pb[2];
                }

                outBones.setRef(boneBuffer.subarray(0, boneCount));

                if (inputSources[i].gripSpace)
                {
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
                }

                break;
            }
        }
    }
    if (!found)
    {
        outGp.setRef(null);
        outBones.setRef(null);
        outIndexRay.setRef(null);
        outWristRay.setRef(null);
        wasClicked = false;
    }

    outFound.set(found);

    next.trigger();
};
