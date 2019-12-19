var tab=null;

function closeTab()
{
    if(tab)gui.mainTabs.closeTab(tab.id);
}


function printNode(html,node,level)
{
    if(!gltf)return;
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
    html+='</td>';

    html+='<td>';

    if(node.mesh)
    {
        for(i=0;i<node.mesh.meshes.length;i++)
        {
            // html+='<a onclick="" class="treebutton">Mesh '+node.mesh.meshes[i].name+'</a> ('+node.mesh.meshes[i].geom.vertices.length/3+' verts)</a>';
            var matname='no material';
            if(node.mesh.meshes[i].material && gltf.json.materials[node.mesh.meshes[i].material]) matname=gltf.json.materials[node.mesh.meshes[i].material].name;
            html+='Mesh '+node.mesh.meshes[i].name+' ('+node.mesh.meshes[i].geom.vertices.length/3+' verts) Material:'+matname;
        }
    }

    html+='</td>';

    html+='<td>';
    var hideclass='';
    if(node.hidden)hideclass='node-hidden';
    html+='<span class="icon iconhover icon-eye '+hideclass+'" onclick="gui.patch().getSelectedOps()[0].op.toggleNodeVisibility(\''+node.name+'\');this.classList.toggle(\'node-hidden\');"></span>';
    html+='</td>';

    html+="</tr>";


    if(node.children)
        for(i=0;i<node.children.length;i++)
        {
            html=printNode(html,gltf.nodes[node.children[i]],level+1);
        }

    return html;
}

function printMaterial(mat,idx)
{
    var html='<tr>';
    html+=' <td>'+idx+'<td>';
    html+=' <td>'+mat.name+'<td>';
    // html+=' <td><a onclick="" class="treebutton">Assign</a><td>';



    html+=' <td style="">'+(gltf.shaders[idx]?"-":'<a onclick="gui.patch().getSelectedOps()[0].op.assignMaterial(\''+mat.name+'\')" class="treebutton">Assign</a>')+'<td>';
    html+=' <td style="width:60%"><td>';

    // console.log();


    html+='</tr>';
    return html;
}

function printInfo()
{
    if(!gltf)return;
    var html='<div style="">';

    html+='<h3>Materials ('+gltf.json.materials.length+')</h3>';

    if(!gltf.json.materials || gltf.json.materials.length==0) html+="No materials";
    else
    {
        html+='<table class="table treetable">';
        html+='<tr>';
        html+=' <th>Name</th>';
        html+=' <th></th>';
        html+=' <th></th>';
        html+=' <th></th>';
        html+=' <th></th>';
        html+='</tr>';
        for(var i=0;i<gltf.json.materials.length;i++)
        {
            html+=printMaterial(gltf.json.materials[i],i);
        }
        html+='</table>';
    }

    html+='<h3>Nodes ('+gltf.nodes.length+')</h3>';
    html+='<table class="table treetable">';

    html+='<tr>';
    html+=' <th colspan="20">Name</th>';
    html+=' <th colspan="110"></th>';
    html+='</tr>';

    for(var i=0;i<gltf.nodes.length;i++)
    {
        if(!gltf.nodes[i].isChild)
            html=printNode(html,gltf.nodes[i],1);
    }
    html+='</table>';


    html+='<h3>Meshes ('+gltf.json.meshes.length+')</h3>';

    html+='<table class="table treetable">';
    html+='<tr>';
    html+=' <th>Name</th>';
    html+=' <th>Material</th>';
    html+=' <th>Indices</th>';
    html+=' <th>Attributes</th>';
    html+='</tr>';

    for(var i=0;i<gltf.json.meshes.length;i++)
    {
        html+='<tr>';
        html+='<td>'+gltf.json.meshes[i].name+"</td>";

        html+='<td>';
        for(var j=0;j<gltf.json.meshes[i].primitives.length;j++)
        {
            if(gltf.json.materials[gltf.json.meshes[i].primitives[j].material])
                html+=gltf.json.materials[gltf.json.meshes[i].primitives[j].material].name;
        }
        html+='</td>';

        html+='<td>';
        for(var j=0;j<gltf.json.meshes[i].primitives.length;j++)
        {
            html+=gltf.json.meshes[i].primitives[j].indices;
        }
        html+='</td>';

        html+='<td>';
        for(var j=0;j<gltf.json.meshes[i].primitives.length;j++)
            html+=Object.keys(gltf.json.meshes[i].primitives[j].attributes);
        html+='</td>';

        html+='</tr>';
    }
    html+='</table>';



    if(gltf.json.animations)
    {
        html+='<h3>Animations ('+gltf.json.animations.length+')</h3>';
        html+='<table class="table treetable">';
        html+='<tr>';
        html+='  <th>name</th>';
        html+='  <th>target node</th>';
        html+='  <th>paths</th>';
        html+='</tr>';

        for(var i=0;i<gltf.json.animations.length;i++)
        {
            html+='<tr>';
            html+='  <td>'+gltf.json.animations[i].name+'</td>';
            html+='  <td>'+gltf.nodes[gltf.json.animations[i].channels[0].target.node].name+'</td>';
            html+='  <td>';

            for(var j=0;j< gltf.json.animations[i].channels.length;j++)
                html+=gltf.json.animations[i].channels[j].target.path+' ';

            html+='  </td>';
            html+='</tr>';
        }
        html+='</table>';

    }
    else
    {
        html+='<h3>Animations (0)</h3>';
    }

    html+='</div>';

    // CABLES.UI.MODAL.show(html);

    closeTab();
    tab=new CABLES.UI.Tab("GLTF",{"icon":"cube","infotext":"tab_gltf","padding":true});
    gui.mainTabs.addTab(tab,true);
    tab.html(html);

    console.log(gltf);
}
