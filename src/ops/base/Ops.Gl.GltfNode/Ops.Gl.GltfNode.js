const
    inExec=op.inTrigger("Render"),
    inNode=op.inInt("Node Index"),
    inDraw=op.inBool("Draw",true),
    inTransform=op.inBool("Transform",true),
    inIgnMaterial=op.inBool("Ignore Material",true),
    outGeom=op.outObject("Geometry")
    ;

const cgl=op.patch.cgl;

inNode.onChange=function()
{
    outGeom.set(null);
};

inExec.onTriggered=function()
{
    if(!cgl.frameStore.currentScene) return;

    var idx=inNode.get();
    idx=Math.max(0,idx);
    idx=Math.min(cgl.frameStore.currentScene.nodes.length-1,idx);

    var n=cgl.frameStore.currentScene.nodes[idx];

    if(inDraw.get()) n.render(cgl, inTransform.get(), inIgnMaterial.get());

console.log(n);



    if(n.mesh && n.mesh.meshes && n.mesh.meshes.length && n.mesh.meshes[0] && n.mesh.meshes[0].geom )
    {

        outGeom.set(n.mesh.meshes[0].geom);
    }

};