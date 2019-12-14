

function printNode(html,node,level)
{
    html+='<tr class="row">';
    var i=0;
    var ident="";

    for(i=0;i<level;i++)
    {
        ident+='<td style="width:20px;height:20px;padding:0px;border-left:1px solid #333;border-bottom:1px solid #333;"><div style=""></div></td>';
    }
    var id=CABLES.uuid();
    html+=ident;
    html+='<td colspan="'+(20-level)+'">';
    if(node.mesh && node.mesh.meshes.length)html+='<span class="icon icon-cube"></span>&nbsp;';
    else html+='<span class="icon corner-down-right"></span> &nbsp;';
    // if(node.mesh && node.mesh.meshes.length>1)html+=" ["+node.mesh.meshes.length+" meshes]";


    html+='<a>'+node.name+'</a>';
    html+='</td>';
    html+='<td>';
    html+='<a onclick="" class="">expose node</a>';
    html+='</td>';

    html+='<td>';

    // if(node.mesh && node.mesh.meshes.length==1)html+=" [mesh]";
    // if(node.mesh && node.mesh.meshes.length>1)html+=" ["+node.mesh.meshes.length+" meshes]";


    if(node.mesh)
    {
        for(i=0;i<node.mesh.meshes.length;i++)
        {
            html+='<span class="icon icon-cube"></span> '+node.mesh.meshes[i].name+' ('+node.mesh.meshes[i].geom.vertices.length/3+' verts)</a>';
        }
    }

    html+='</td>';

    html+='<td>';
    html+='<span class="icon icon-eye"></span>';
    html+='</td>';

    html+="</tr>";


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
    var html='<div style="">';

    html+='Nodes<br/>';
    html+='<table class="treetable table">';
    for(var i=0;i<gltf.nodes.length;i++)
    {
        html=printNode(html,gltf.nodes[i],1);
    }

    html+='</table>';
    html+='</div>';

    CABLES.UI.MODAL.show(html);

}
