const exec = op.inTrigger("Exec"),
    outNumNodes = op.outNumber("Num Nodes"),
    outNumCams = op.outNumber("Num Cams"),
    outFileUrl = op.outString("FileUrl"),
    outFilenameShort = op.outString("FileName"),
    outCamNames = op.outArray("Camera Names");

exec.onTriggered = () =>
{
    const gltf = op.patch.cgl.tempData.currentScene;
    if (!gltf) return;

    if (gltf.cameras)
    {
        outNumCams.set(gltf.cameras.length);
        const arrCamNames = [];

        for (let i = 0; i < gltf.cameras.length; i++)
        {
            arrCamNames.push(gltf.cameras[i].name);
        }
        outCamNames.set(arrCamNames);
    }
    if (gltf.nodes)outNumNodes.set(gltf.nodes.length);

    outFileUrl.set(gltf.cables.fileUrl);
    outFilenameShort.set(gltf.cables.shortFileName);
};
