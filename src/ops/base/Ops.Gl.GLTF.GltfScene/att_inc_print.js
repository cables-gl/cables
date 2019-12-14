

function printNode(node,level)
{
    var str="";
    var i=0;
    for(i=0;i<level;i++)
    {
        str+="| ";
    }

    str+=node.name;


    if(node.mesh && node.mesh.meshes.length==1)str+=" [mesh]";
    if(node.mesh && node.mesh.meshes.length>1)str+=" ["+node.mesh.meshes.length+" meshes]";

    console.log(str);

    if(node.children)
        for(i=0;i<node.children.length;i++)
        {
            printNode(gltf.nodes[node.children[i]],level+1);
        }

}

function printInfo()
{
    console.log("GLTF INFO------------");
    for(var i=0;i<gltf.nodes.length;i++)
    {
        printNode(gltf.nodes[i],0);
    }
}
