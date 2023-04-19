const exec = op.inTrigger("Exec"),
    outNumNodes = op.outNumber("Num Nodes"),
    outNumCams = op.outNumber("Num Cams"),
    outFileUrl = op.outString("FileUrl"),
    outFilenameShort = op.outString("FileName");

exec.onTriggered = () =>
{
    const gltf = op.patch.cgl.frameStore.currentScene;
    if (!gltf) return;

    if (gltf.cameras)outNumCams.set(gltf.cameras.length);
    if (gltf.nodes)outNumNodes.set(gltf.nodes.length);

    outFileUrl.set(gltf.cables.fileUrl);
    outFilenameShort.set(gltf.cables.shortFileName);
};
