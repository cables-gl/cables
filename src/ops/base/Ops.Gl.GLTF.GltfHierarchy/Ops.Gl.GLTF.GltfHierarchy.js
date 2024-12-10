const
    exec = op.inTrigger("Trigger"),
    inNodeName = op.inString("Node name", "default"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Bones Lines");

exec.onTriggered = update;

const cgl = op.patch.cgl;


let node = null;
const tr = vec3.create();



inNodeName.onChange = () =>
{
    node = null;
    update();
};

function addChild(gltf, arr, parent, child)
{
    if (parent)
    {
        mat4.getTranslation(tr, parent.modelMatAbs());
        arr.push(tr[0], tr[1], tr[2]);

        mat4.getTranslation(tr, child.modelMatAbs());
        arr.push(tr[0], tr[1], tr[2]);
    }

    if (child && child.children)
    {
        for (let i = 0; i < child.children.length; i++)
        {
            addChild(gltf, arr, child, gltf.nodes[child.children[i]]);
        }
    }
}

function update()
{
    if (!cgl.tempData.currentScene) return;

    let arr = [];
    let found = false;
    const idx = 0;
    const gltf = cgl.tempData.currentScene;

    if (!node)
    {
        const name = inNodeName.get();

        for (let i = 0; i < gltf.nodes.length; i++)
        {
            if (gltf.nodes[i].name == name)
            {
                node = gltf.nodes[i];
                found = true;
                break;
            }
        }
    }
    else
    {
        found = true;
    }


    if (found && node)
    {
        for (let i = 0; i < node.children.length; i++)
        {
            addChild(gltf, arr, null, gltf.nodes[node.children[i]]);
        }

        outArr.setRef(arr);
    }
    else
    {
        outArr.set(null);
        return;
    }

    next.trigger();
}
