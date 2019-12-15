
function printNode(html,node,level)
{
    html+='<tr class="row">';
    var i=0;
    var ident="";

    for(i=0;i<level;i++)
    {
        // var last=level-1==i;
        // var identClass=last?"identnormal":"identlast";

        var identClass="identBg";
        if(i==0)identClass="identBgLevel0";
        // if(i==level-1)identClass="identBgLast";
        ident+='<td class="ident  '+identClass+'" ><div style=""></div></td>';
    }
    var id=CABLES.uuid();
    html+=ident;
    html+='<td colspan="'+(20-level)+'">';

    if(node.mesh && node.mesh.meshes.length)html+='<span class="icon icon-cube"></span>&nbsp;';
    else html+='<span class="icon icon-circle"></span> &nbsp;';

    html+='<a>'+node.name+'</a>';
    html+='</td>';
    html+='<td>';
    html+='<a onclick="" class="treebutton">Expose</a>';
    html+='</td>';

    html+='<td>';

    if(node.mesh)
    {
        for(i=0;i<node.mesh.meshes.length;i++)
        {
            html+='<a onclick="" class="treebutton">Mesh '+node.mesh.meshes[i].name+'</a> ('+node.mesh.meshes[i].geom.vertices.length/3+' verts)</a>';
        }
    }

    html+='</td>';

    html+='<td>';
    var hideclass='';
    if(node.hidden)hideclass='node-hidden';
    html+='<span class="icon iconhover icon-eye '+hideclass+'" onclick="gui.patch().getSelectedOps()[0].op.hideNode(\''+node.name+'\');this.classList.toggle(\'node-hidden\');"></span>';
    html+='</td>';

    html+="</tr>";


    if(node.children)
        for(i=0;i<node.children.length;i++)
        {
            html=printNode(html,gltf.nodes[node.children[i]],level+1);
        }

    return html;
}

function printMaterial(mat)
{
    var html='<tr>';
    html+='<td>'+mat.name+'<td>';
    html+='<td><a onclick="" class="treebutton">Assign</a><td>';
    html+='<td style="width:60%"><td>';
    html+='</tr>';
    return html;
}

function printInfo()
{
    var html='<div style="">';

    html+='<h3>Materials</h3>';

    if(!gltf.json.materials || gltf.json.materials.length==0) html+="No materials";
    else
    {
        html+='<table class="table treetable">';
        for(var i=0;i<gltf.json.materials.length;i++)
        {
            html+=printMaterial(gltf.json.materials[i]);
        }
        html+='</table>';
    }

    html+='<h3>Nodes</h3>';
    html+='<table class="table treetable">';
    for(var i=0;i<gltf.nodes.length;i++)
    {
        if(!gltf.nodes[i].isChild)
            html=printNode(html,gltf.nodes[i],1);
    }

    html+='</table>';
    html+='</div>';

    CABLES.UI.MODAL.show(html);
}
