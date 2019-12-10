const
    inExec=op.inTrigger("Render"),
    inNode=op.inInt("Node Index"),
    inTransform=op.inBool("Transform",true),
    inIgnMaterial=op.inBool("Ignore Material",true)
    ;

const cgl=op.patch.cgl;


inExec.onTriggered=function()
{
    if(!cgl.frameStore.currentScene) return;

    var idx=inNode.get();
    idx=Math.max(0,idx);
    idx=Math.min(cgl.frameStore.currentScene.nodes.length-1,idx);

    cgl.frameStore.currentScene.nodes[idx].render(cgl, inTransform.get(), inIgnMaterial.get());

};