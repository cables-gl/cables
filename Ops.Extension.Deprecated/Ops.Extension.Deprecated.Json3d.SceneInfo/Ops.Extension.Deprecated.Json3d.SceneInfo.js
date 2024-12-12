const render = op.inTrigger("Render");
const next = op.outTrigger("Next");

const numNodes = op.outValue("Num Nodes");
const numMaterials = op.outValue("Num Materials");
const numMeshes = op.outValue("Num Meshes");
const numBones = op.outValue("Num Bones");

const numAnims = op.outValue("Num Animations");
const numAnimsChannels = op.outValue("Num Anim Channels");
const outDuration = op.outValue("Anim Duration");

const inDump = op.inTriggerButton("Dump Console");

const cgl = op.patch.cgl;
const scene = null;

inDump.onTriggered = function ()
{
    op.log(scene);
};

function isBone(name)
{
    if (!scene) return false;
    for (let j = 0; j < scene.meshes.length; j++)
        if (scene.meshes[j].bones)
            for (let i = 0; i < scene.meshes[j].bones.length; i++)
                if (scene.meshes[j].bones[i].name == name)
                    return true;
    return false;
}

function findBoneChilds(n, bones)
{
    for (let i = 0; i < n.children.length; i++)
    {
        if (isBone(n.children[i].name))
            bones++;
        if (n.children[i].children)bones = findBoneChilds(n.children[i], bones);
    }
    return bones;
}

function countNodes(n, count)
{
    count++;
    if (n.children)
    {
        for (let i = 0; i < n.children.length; i++)
        {
            count = countNodes(n.children[i], count);
        }
    }
    return count;
}

render.onTriggered = function ()
{
    if (cgl.tempData.currentScene)
    {
        const scene = cgl.tempData.currentScene.getValue();

        if (scene)
        {
            if (scene.animations)numAnims.set(scene.animations.length);
            if (scene.animations)
            {
                let num = 0;
                for (let i = 0; i < scene.animations.length; i++)
                {
                    num += scene.animations[i].channels.length || 0;
                }
                numAnimsChannels.set(num);
            }
            if (scene.materials)numMaterials.set(scene.materials.length);
            if (scene.meshes)numMeshes.set(scene.meshes.length);

            if (scene.animations && scene.animations[0].duration)outDuration.set(scene.animations[0].duration);

            const bones = findBoneChilds(scene.rootnode, 0);
            numBones.set(bones);

            numNodes.set(countNodes(scene.rootnode, 0));
        }
    }
    next.trigger();
};
