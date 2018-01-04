var render=op.inFunction("Render");
var next=op.outFunction("Next");

var numNodes=op.outValue("Num Nodes");
var numMaterials=op.outValue("Num Materials");
var numMeshes=op.outValue("Num Meshes");
var numAnims=op.outValue("Num Animations");
var numBones=op.outValue("Num Bones");


var inDump=op.inFunctionButton("Dump Console");

var cgl=op.patch.cgl;



inDump.onTriggered=function()
{
    console.log(scene);
};

function isBone(name)
{
    for(var j=0;j<scene.meshes.length;j++)
        if(scene.meshes[j].bones)
            for(var i=0;i<scene.meshes[j].bones.length;i++)
                if(scene.meshes[j].bones[i].name==name)
                    return true;
    return false;
}

function findBoneChilds(n,bones)
{
    for(var i=0;i<n.children.length;i++)
    {
        if(isBone(n.children[i].name))
            bones++;
        if(n.children[i].children)bones=findBoneChilds(n.children[i],bones);
    }
    return bones;
}

function countNodes(n,count)
{
    count++;
    if(n.children)
    {
        for(var i=0;i<n.children.length;i++)
        {
            count=countNodes(n.children[i],count);
        }
    }
    return count;
}

render.onTriggered=function()
{
    if(cgl.frameStore.currentScene)
    {
    scene=cgl.frameStore.currentScene.getValue();

    if(scene)
    {
        // console.log(scene);
        if(scene.animations)numAnims.set(scene.animations.length);
        if(scene.materials)numMaterials.set(scene.materials.length);
        if(scene.meshes)numMeshes.set(scene.meshes.length);

        var bones=findBoneChilds(scene.rootnode,0);
        numBones.set(bones);
        
        numNodes.set( countNodes(scene.rootnode,0) );
    }
    
          
    }
  next.trigger();

};