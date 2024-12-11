const
    inExec = op.inTrigger("Update"),
    inName = op.inString("Node Name", "default"),
    outArr = op.outArray("Matrix", null, 4),
    outFound = op.outBool("Found");

let camNode = null;

inExec.onTriggered = () =>
{
    if (!camNode) findCam();

    if (camNode)
    {
        camNode.start(0);
        camNode.end();
        outArr.setRef(camNode.vMat);
    }
};

inName.onChange = () => { camNode = null; };

function findCam()
{
    const gltf = op.patch.cgl.tempData.currentScene;

    if (gltf)
    {
        gltf.cameras = gltf.cameras || [];
        for (let i = 0; i < gltf.cameras.length; i++)
        {
            if (gltf.cameras[i].name == inName.get())
            {
                camNode = gltf.cameras[i];
                // console.log("a", camNode.node.name, camNode.node._node.rotation);
                outFound.set(true);
                return;
            }
        }
    }

    outFound.set(false);
}
