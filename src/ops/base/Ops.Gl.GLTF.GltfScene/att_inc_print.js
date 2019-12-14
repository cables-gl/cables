

function printNode(html,node,level)
{
    var tt=""
    if(node.mesh)
    {
        for(i=0;i<node.mesh.meshes.length;i++)
        {
            tt+="- mesh: "+node.mesh.meshes[i].name+'('+node.mesh.meshes[i].geom.vertices.length/3+' verts) <br/>';
        }

    }




    var i=0;
    var ident="";
    for(i=0;i<level;i++)
    {
        ident+="| ";
    }
    var id=CABLES.uuid();
    html+=ident;
    html+='<a class="tt" data-tt="'+tt+'">'+node.name+'</a>';

    if(node.mesh && node.mesh.meshes.length==1)html+=" [mesh]";
    if(node.mesh && node.mesh.meshes.length>1)html+=" ["+node.mesh.meshes.length+" meshes]";

    html+='<br/>';


    if(node.children)
        for(i=0;i<node.children.length;i++)
        {
            html=printNode(html,gltf.nodes[node.children[i]],level+1);
        }


    return html;
}

function printMaterial()
{

}


function printInfo()
{
    var html='<div style="font-family:monospace;">';


    html+='Nodes<br/>';
    for(var i=0;i<gltf.nodes.length;i++)
    {
        html=printNode(html,gltf.nodes[i],1);
    }


    html+='</div>';

    CABLES.UI.MODAL.show(html);

}
