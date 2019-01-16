var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION ));
op.index=op.inValueInt("mesh index");
var centerPivot=op.addInPort(new CABLES.Port(op,"center pivot",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'} ));
const next=op.outTrigger("next");

var geometryOut=op.addOutPort(new CABLES.Port(op,"geometry",CABLES.OP_PORT_TYPE_OBJECT ));
var draw=op.addInPort(new CABLES.Port(op,"draw",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

op.index.set(0);
geometryOut.ignoreValueSerialize=true;
centerPivot.set(false);
draw.set(true);

const cgl=op.patch.cgl;
// var mesh=null;
var meshesCache={};
var currentIndex=0;

op.index.onChange=reload;
render.onTriggered=doRender;

function doRender()
{
    var idx=op.index.get();
    var mesh=meshesCache[idx];
    // if(!mesh || currentIndex!=idx) reload();
    if(!mesh) reload();

    if(draw.get())
    {
        if(mesh) mesh.render(cgl.getShader());
        next.trigger();
    }
}

function reload()
{
    if(!cgl.frameStore.currentScene || !cgl.frameStore.currentScene.getValue())return;
    var meshes=cgl.frameStore.currentScene.getValue().meshes;

    var mesh=null;

    const indx=op.index.get();

    if(cgl.frameStore.currentScene && cgl.frameStore.currentScene.getValue() && indx>=0)
    {
        op.uiAttr({warning:''});
        op.uiAttr({info:''});

        var jsonMesh=null;

        currentIndex=indx;

        if(CABLES.UTILS.isNumeric(indx))
        {
            if(indx<0 || indx>=cgl.frameStore.currentScene.getValue().meshes.length)
            {
                op.uiAttr({warning:'mesh not found - index out of range '});
                return;
            }

            jsonMesh=cgl.frameStore.currentScene.getValue().meshes[parseInt(indx,10) ];
        }

        if(!jsonMesh)
        {
            mesh=null;
            op.uiAttr({warning:'mesh not found'});
            return;
        }
        op.uiAttribs.warning='';

        var i=0;
        var verts=JSON.parse(JSON.stringify(jsonMesh.vertices));

        var geom=new CGL.Geometry();
        geom.vertices=verts;
        geom.vertexNormals=jsonMesh.normals||[];
        geom.tangents=jsonMesh.tangents||[];
        geom.biTangents=jsonMesh.bitangents||[];

        if(centerPivot.get())geom.center();

        if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];
        geom.verticesIndices=[];

        console.log(geom.verticesIndices.length);

        for(var i=0;i<jsonMesh.faces.length;i++)
        {
            geom.verticesIndices.push(jsonMesh.faces[i][0],jsonMesh.faces[i][1],jsonMesh.faces[i][2]);
        }
        // geom.verticesIndices=[].concat.apply([], jsonMesh.faces);

        // var nfo='';
        // nfo += (geom.verticesIndices.length/3)+' faces <br/>';
        // nfo += (geom.vertices.length/3)+' vertices <br/>';
        // nfo += geom.texCoords.length+' texturecoords <br/>';
        // nfo += geom.tangents.length+' tangents <br/>';
        // nfo += geom.biTangents.length+' biTangents <br/>';
        // if(geom.vertexNormals) nfo += geom.vertexNormals.length+' normals <br/>';

        // op.uiAttr({"info":nfo});

        geometryOut.set(null);
        geometryOut.set(geom);
        mesh=new CGL.Mesh(cgl,geom);
        meshesCache[indx]=mesh;
    }
}

centerPivot.onChange=function()
{
    // todo: dispose meshes
    meshesCache={};

};
