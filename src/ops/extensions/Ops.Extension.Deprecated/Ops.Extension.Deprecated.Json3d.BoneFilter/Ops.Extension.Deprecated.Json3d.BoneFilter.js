const exec = op.inTrigger("Exec");
const joint = op.inValueSelect("Joint");
const next = op.outTrigger("Next");

const cgl = op.patch.cgl;

let oldBones = null;
let oldBonesNum = 0;
let boneIndex = -1;

joint.onChange = function ()
{
    if (oldBones)
    {
        for (let i = 0; i < oldBones.length; i++)
        {
            if (joint.get() == oldBones[i].name)boneIndex = i;
        }
    }
};

exec.onTriggered = function ()
{
    if (cgl.frameStore.bones != oldBones || oldBonesNum != cgl.frameStore.bones.length)
    {
        const bones = oldBones = cgl.frameStore.bones;
        oldBonesNum = cgl.frameStore.bones.length;

        const values = [];
        const oldValue = joint.get();

        for (let i = 0; i < bones.length; i++)
        {
            values.push(bones[i].name);

            if (joint.get() == bones[i].name)boneIndex = i;
        }

        // joint=op.inValueSelect("Joint",values,oldValue);
        joint.setUiAttribs({ "values": values });
    }

    if (cgl.frameStore.bones)
    {
        const bone = cgl.frameStore.bones[boneIndex];
        cgl.pushModelMatrix();

        mat4.mul(cgl.mMatrix, cgl.mMatrix, bone.boneMatrix);
        // mat4.translate()
        // cgl.frameStore.bones.transformed
        next.trigger();
        cgl.popModelMatrix();
    }
};
