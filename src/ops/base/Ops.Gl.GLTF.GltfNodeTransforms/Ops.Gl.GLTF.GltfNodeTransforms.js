const
    inExec = op.inTrigger("Render"),
    inStr = op.inString("Search", ""),
    inSort = op.inSwitch("Order", ["None", "AlphaNumerical"], "None"),
    outPos = op.outArray("Positions"),
    next = op.outTrigger("Next"),
    outScale = op.outArray("Scale"),
    outNames = op.outArray("Names");

// outRot=op.outArray("Rotation");

const cgl = op.patch.cgl;
let needsupdate = true;
outPos.onChange = function () { needsupdate = true; };
inExec.onTriggered = exec;

inStr.onChange = function ()
{
    needsupdate = true;
};
function exec()
{
    // if (needsupdate)
    update();
    next.trigger();
}

function update()
{
    outPos.set(null);
    outScale.set(null);
    outNames.set(null);
    // outRot.set(null);

    if (!cgl.tempData.currentScene) return;

    const arrPos = [];
    const arrRot = [];
    const arrScale = [];
    const arrNames = [];

    for (let i = 0; i < cgl.tempData.currentScene.nodes.length; i++)
    {
        if (cgl.tempData.currentScene.nodes[i].name.indexOf(inStr.get()) == 0)
        {
            const n = cgl.tempData.currentScene.nodes[i]._node;
            arrNames.push(n.name);

            if (n.translation) arrPos.push(n.translation[0], n.translation[1], n.translation[2]);
            else arrPos.push(0, 0, 0);

            if (n.scale) arrScale.push(n.scale[0], n.scale[1], n.scale[2]);
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

    outPos.set(arrPos);
    outScale.set(arrScale);
    outNames.set(arrNames);
    // outRot.set(arrRot);

    needsupdate = false;
}
