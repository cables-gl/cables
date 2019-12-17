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
                // console.log("NODE",node);
                outFound.set(true);
            }
        }
    }

    // var idx=inNode.get();
    // idx=Math.max(0,idx);
    // idx=Math.min(cgl.frameStore.currentScene.nodes.length-1,idx);

    // var n=cgl.frameStore.currentScene.nodes[idx];

    cgl.pushModelMatrix();



    if(node)
    {
        // node.pushTransform();

        if(inTrans.get())
        {
            cgl.pushModelMatrix();
            node.transform(cgl);
        }

        // console.log(!inDraw.get());
        node.render(cgl, false, !inDraw.get(), inIgnMaterial.get(),!inChilds.get());
    }


    next.trigger();

    if(node)
    {
        if(inTrans.get()) cgl.popModelMatrix();
    }

    cgl.popModelMatrix();



    // // console.log(n);


    // if(n.mesh && n.mesh.meshes && n.mesh.meshes.length && n.mesh.meshes[0] && n.mesh.meshes[0].geom )
    // {

    //     outGeom.set(n.mesh.meshes[0].geom);
    // }

};