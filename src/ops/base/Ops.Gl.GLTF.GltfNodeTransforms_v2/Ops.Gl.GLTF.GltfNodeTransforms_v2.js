const
    inExec = op.inTrigger("Render"),
    inStr = op.inString("Search", ""),
    inSort = op.inSwitch("Order", ["None", "AlphaNumerical"], "None"),
    inSpace = op.inSwitch("Space", ["GLTF", "World"], "GLTF"),
    next = op.outTrigger("Next"),
    outPos = op.outArray("Positions"),
    outScale = op.outArray("Scale"),
    outRot = op.outArray("Rotation"),
    outNames = op.outArray("Names");

const cgl = op.patch.cgl;
const arrPos = [];
const arrRot = [];
const arrScale = [];
const arrNames = [];
let needsupdate = true;
let oldScene = null;

inSpace.onChange =
    inSort.onChange =
    inStr.onChange =
    outPos.onChange = () => { needsupdate = true; };

inExec.onTriggered = exec;

function exec()
{
    if (cgl.tempData.currentScene != oldScene)needsupdate = true;
    if (needsupdate) update();

    outPos.setRef(arrPos);
    outScale.setRef(arrScale);
    outNames.setRef(arrNames);
    outRot.setRef(arrRot);

    next.trigger();
}

function update()
{
    if (!cgl.tempData.currentScene) return;

    oldScene = cgl.tempData.currentScene;

    arrPos.length = 0;
    arrRot.length = 0;
    arrScale.length = 0;
    arrNames.length = 0;

    const tr = vec3.create();
    const q = quat.create();
    let m = null;

    const worldspace = inSpace.get() == "World";

    for (let i = 0; i < cgl.tempData.currentScene.nodes.length; i++)
    {
        if (cgl.tempData.currentScene.nodes[i].name.indexOf(inStr.get()) == 0)
        {
            const n = cgl.tempData.currentScene.nodes[i]._node;
            const node = cgl.tempData.currentScene.nodes[i];
            arrNames.push(n.name);

            if (!worldspace)
                m = node.modelMatLocal();
            else
                m = node.modelMatAbs();

            mat4.getTranslation(tr, m);

            arrPos.push(tr[0], tr[1], tr[2]);

            mat4.getRotation(q, m);
            arrRot.push(q[0], q[1], q[2], q[3]);

            if (node._tempAnimScale) arrScale.push(node._tempAnimScale[0], node._tempAnimScale[1], node._tempAnimScale[2]);
            else if (n.scale) arrScale.push(n.scale[0], n.scale[1], n.scale[2]);
            else arrScale.push(1, 1, 1);
        }
    }

    if (inSort.get())
    {
        let list = [];
        for (let j = 0; j < arrNames.length; j++)
            list.push({
                "name": arrNames[j],
                "pos": [arrPos[j * 3 + 0], arrPos[j * 3 + 1], arrPos[j * 3 + 2]],
                "scale": [arrScale[j * 3 + 0], arrScale[j * 3 + 1], arrScale[j * 3 + 2]]
            });

        list.sort(function (a, b)
        {
            return ((a.name < b.name) ? -1 : ((a.name == b.name) ? 0 : 1));
            // Sort could be modified to, for example, sort on the age
            // if the name is the same.
        });

        // 3) separate them back out:
        for (let k = 0; k < list.length; k++)
        {
            arrNames[k] = list[k].name;
            arrPos[k * 3 + 0] = list[k].pos[0];
            arrPos[k * 3 + 1] = list[k].pos[1];
            arrPos[k * 3 + 2] = list[k].pos[2];
            arrScale[k * 3 + 0] = list[k].scale[0];
            arrScale[k * 3 + 1] = list[k].scale[1];
            arrScale[k * 3 + 2] = list[k].scale[2];
        }
    }

    outPos.setRef(arrPos);
    outScale.setRef(arrScale);
    outNames.setRef(arrNames);
    outRot.setRef(arrRot);

    needsupdate = false;
}
