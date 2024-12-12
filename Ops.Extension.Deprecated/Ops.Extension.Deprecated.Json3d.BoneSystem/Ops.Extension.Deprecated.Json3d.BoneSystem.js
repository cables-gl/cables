// https://www.khronos.org/opengl/wiki/Skeletal_Animation
// http://ogldev.atspace.co.uk/www/tutorial38/tutorial38.html

let render = op.inTrigger("Render");
let inMeshIndex = op.inValueInt("Mesh Index");

let inTime = op.inValue("Time");

let inFade = op.inValueSlider("Fade Times");
let inTime2 = op.inValue("Time2");

let next = op.outTrigger("Next");
let outNumBounes = op.outValue("Num Bones");
let outSpline = op.outArray("Spline");
let outJoint = op.outTrigger("Joint Trigger");

let points = [];
let tempMat = mat4.create();
let tempVec = vec3.create();
let emptyVec = vec3.create();
let transVec = vec3.create();

let alwaysEmptyVec = vec3.create();
let q = quat.create();
let q2 = quat.create();
let qMat = mat4.create();
let boneMatrix = mat4.create();

let cgl = op.patch.cgl;
let scene = null;
let meshIndex = 0;
let bones = 0;
let oldScene = null;
let boneList = [];
let fillBoneList = true;
let pointCounter = 0;

inMeshIndex.onChange = function ()
{
    meshIndex = inMeshIndex.get();
};

function findBoneChilds(n, parent, foundBone)
{
    function isBone(name)
    {
        if (scene.meshes[meshIndex].bones)
            for (let i = 0; i < scene.meshes[meshIndex].bones.length; i++)
                if (scene.meshes[meshIndex].bones[i].name == name)
                    return scene.meshes[meshIndex].bones[i];
        return false;
    }

    function findAnimation(name)
    {
        var an = 0;
        for (var an = 0; an < scene.animations.length; an++)

            for (let i = 0; i < scene.animations[an].channels.length; i++)
                if (scene.animations[an].channels[i].name == name)
                    return scene.animations[an].channels[i];

        return null;
    }

    let time = op.patch.timer.getTime();
    if (inTime.isLinked() || inTime.get() !== 0)time = inTime.get();
    let time2 = inTime2.get();

    cgl.pushModelMatrix();

    let bone = isBone(n.name);

    if ((bone || foundBone) && n != scene.rootnode)
    {
        foundBone = true;

        if (!n.anim)
        {
            // create anim objects for translation/rotation
            let anim = findAnimation(n.name);
            if (anim)
            {
                n.anim = anim;

                if (anim && !n.quatAnimX && anim.rotationkeys)
                {
                    n.quatAnimX = new CABLES.Anim();
                    n.quatAnimY = new CABLES.Anim();
                    n.quatAnimZ = new CABLES.Anim();
                    n.quatAnimW = new CABLES.Anim();

                    for (var k in anim.rotationkeys)
                    {
                        n.quatAnimX.setValue(anim.rotationkeys[k][0], anim.rotationkeys[k][1][1]);
                        n.quatAnimY.setValue(anim.rotationkeys[k][0], anim.rotationkeys[k][1][2]);
                        n.quatAnimZ.setValue(anim.rotationkeys[k][0], anim.rotationkeys[k][1][3]);
                        n.quatAnimW.setValue(anim.rotationkeys[k][0], anim.rotationkeys[k][1][0]);
                    }
                }
                if (anim && !n.posAnimX && anim.positionkeys)
                {
                    n.posAnimX = new CABLES.Anim();
                    n.posAnimY = new CABLES.Anim();
                    n.posAnimZ = new CABLES.Anim();

                    for (var k in anim.positionkeys)
                    {
                        n.posAnimX.setValue(anim.positionkeys[k][0], anim.positionkeys[k][1][0]);
                        n.posAnimY.setValue(anim.positionkeys[k][0], anim.positionkeys[k][1][1]);
                        n.posAnimZ.setValue(anim.positionkeys[k][0], anim.positionkeys[k][1][2]);
                    }
                }
            }
        }

        if (n.posAnimX)
        {
            transVec[0] = n.posAnimX.getValue(time);
            transVec[1] = n.posAnimY.getValue(time);
            transVec[2] = n.posAnimZ.getValue(time);

            if (inFade.get() != 0)
            {
                transVec[0] = (transVec[0] * (1.0 - inFade.get())) + (n.posAnimX.getValue(time2) * inFade.get());
                transVec[1] = (transVec[1] * (1.0 - inFade.get())) + (n.posAnimY.getValue(time2) * inFade.get());
                transVec[2] = (transVec[2] * (1.0 - inFade.get())) + (n.posAnimZ.getValue(time2) * inFade.get());

                mat4.translate(cgl.mMatrix, cgl.mMatrix, transVec);
            }
            else
            {
                mat4.translate(cgl.mMatrix, cgl.mMatrix, transVec);
            }
        }

        if (n.quatAnimX)
        {
            CABLES.Anim.slerpQuaternion(time, q, n.quatAnimX, n.quatAnimY, n.quatAnimZ, n.quatAnimW);

            if (inFade.get() != 0)
            {
                CABLES.Anim.slerpQuaternion(time2, q2, n.quatAnimX, n.quatAnimY, n.quatAnimZ, n.quatAnimW);
                quat.slerp(q, q, q2, inFade.get());
            }

            mat4.fromQuat(qMat, q);
            mat4.multiply(cgl.mMatrix, cgl.mMatrix, qMat);
        }

        // get position
        vec3.transformMat4(tempVec, alwaysEmptyVec, cgl.mMatrix);
        if (!n.boneMatrix)
        {
            n.boneMatrix = mat4.create();
            n.transformed = vec3.create();
        }
        vec3.copy(n.transformed, tempVec);

        mat4.copy(n.boneMatrix, cgl.mMatrix);

        // store absolute bone matrix
        if (bone)
        {
            if (!bone.matrix)bone.matrix = mat4.create();
            mat4.copy(bone.matrix, cgl.mMatrix);

            if (!bone.transposedOffsetMatrix)
            {
                mat4.transpose(bone.offsetmatrix, bone.offsetmatrix);
                bone.transposedOffsetMatrix = true;
            }
            mat4.mul(bone.matrix, bone.matrix, bone.offsetmatrix);
        }

        if (parent && parent.transformed)
        {
            points[pointCounter++] = parent.transformed[0];
            points[pointCounter++] = parent.transformed[1];
            points[pointCounter++] = parent.transformed[2];

            points[pointCounter++] = tempVec[0];
            points[pointCounter++] = tempVec[1];
            points[pointCounter++] = tempVec[2];
        }

        if (fillBoneList) boneList.push(n);
        cglframeStorebone = n;
    }

    if (n.children)
    {
        for (let i = 0; i < n.children.length; i++)
        {
            if (isBone(n.children[i].name)) bones++;
            findBoneChilds(n.children[i], n, foundBone);
        }
    }

    cgl.popModelMatrix();

    return bones;
}

render.onTriggered = function ()
{
    pointCounter = 0;
    bones = 0;
    scene = cglframeStorecurrentScene.getValue();
    cglframeStorebones = boneList;

    if (!scene) return;
    if (scene != oldScene)
    {
        fillBoneList = true;
        boneList.length = 0;
        oldScene = scene;
    }

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);
    findBoneChilds(scene.rootnode, null, false);
    cgl.popModelMatrix();

    outSpline.set(null);
    outSpline.set(points);
    outNumBounes.set(bones);
    fillBoneList = false;

    next.trigger();
    cglframeStorebones = null;
};
