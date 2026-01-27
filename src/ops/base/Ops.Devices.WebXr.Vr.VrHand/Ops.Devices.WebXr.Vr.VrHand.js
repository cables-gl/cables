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

    outTransformed = op.outTrigger("Transformed Position"),

    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;
let wasClicked = false;

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

function dist3d(a, b)
{
    const xd = b[0] - a[0];
    const yd = b[1] - a[1];
    const zd = b[2] - a[2];

    return Math.sqrt(xd * xd + yd * yd + zd * zd);
}

inUpdate.onTriggered = () =>
{
    let found = false;

    if (op.patch.cgl.tempData.xrSession)
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
                { // XRHand is iterable
                    const pose = cgl.tempData.xrFrame.getJointPose(jointSpace, cgl.tempData.xrReferenceSpace);
                    if (!pose) continue;

                    jointPositions[jointName] = [pose.transform.position.x, pose.transform.position.y, pose.transform.position.z];
                }
                outGp.setRef(jointPositions);

                /// ///////////////////

                if (dist3d(jointPositions["thumb-tip"], jointPositions["index-finger-tip"]) < 0.06)
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

                /// ////////////////////

                const boneArray = [];

                for (const [a, b] of bones)
                {
                    const pa = jointPositions[a];
                    const pb = jointPositions[b];
                    if (!pa || !pb) continue;

                    boneArray.push(pa[0], pa[1], pa[2]);
                    boneArray.push(pb[0], pb[1], pb[2]);
                }

                outBones.setRef(boneArray);

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
    if (!found) outGp.setRef(null);

    outFound.set(found);

    next.trigger();
};
