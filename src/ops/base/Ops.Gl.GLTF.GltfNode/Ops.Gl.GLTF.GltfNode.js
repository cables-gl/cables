const
    inExec=op.inTrigger("Render"),
    inNodeName=op.inString("Node Name"),
    inTrans=op.inBool("Transformation",true),
    inDraw=op.inBool("Draw Mesh",true),
    inChilds=op.inBool("Draw Childs",true),
    inIgnMaterial=op.inBool("Ignore Material",true),
    next=op.outTrigger("Next"),
    outGeom=op.outObject("Geometry"),
    outFound=op.outBool("Found")
    ;

const cgl=op.patch.cgl;

var node=null;

inNodeName.onChange=function()
{
    outGeom.set(null);
    node=null;
    outFound.set(false);
};

inExec.onTriggered=function()
{
    if(!cgl.frameStore.currentScene) return;

    if(!node)
    {
        const name=inNodeName.get();

        if(!cgl.frameStore || !cgl.frameStore.currentScene || !cgl.frameStore.currentScene.nodes)
        {
            return;
        }

        for(var i=0;i<cgl.frameStore.currentScene.nodes.length;i++)
        {
            if(cgl.frameStore.currentScene.nodes[i].name==name)
            {
                node=cgl.frameStore.currentScene.nodes[i];
                outFound.set(true);

                if(node && node.mesh && node.mesh.meshes && node.mesh.meshes[0].geom) outGeom.set(node.mesh.meshes[0].geom);
                else outGeom.set(null);
            }
        }
    }

    cgl.pushModelMatrix();

    if(node)
    {
        if(inTrans.get())
        {
            cgl.pushModelMatrix();
            node.transform(cgl);
        }

        node.render(cgl, false, !inDraw.get(), inIgnMaterial.get(),!inChilds.get(),true);
    }


    next.trigger();

    if(node)
    {
        if(inTrans.get()) cgl.popModelMatrix();
    }

    cgl.popModelMatrix();

};