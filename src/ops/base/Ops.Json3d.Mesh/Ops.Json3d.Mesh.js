var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION ));
// op.index=op.addInPort(new Port(op,"mesh index",OP_PORT_TYPE_VALUE,{type:'string'} ));
op.index=op.inValueInt("mesh index");
var centerPivot=op.addInPort(new Port(op,"center pivot",OP_PORT_TYPE_VALUE,{display:'bool'} ));
var next=op.addOutPort(new Port(op,"next",OP_PORT_TYPE_FUNCTION));

var geometryOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT ));
var draw=op.addInPort(new Port(op,"draw",OP_PORT_TYPE_VALUE,{display:'bool'}));

op.index.set(0);
geometryOut.ignoreValueSerialize=true;
centerPivot.set(false);
draw.set(true);

const cgl=op.patch.cgl;
var mesh=null;
var currentIndex=0;

op.index.onValueChanged=reload;
render.onTriggered=doRender;

function doRender()
{
    // if(!mesh && cgl.frameStore.currentScene && cgl.frameStore.currentScene.getValue() || currentIndex!=op.index.get()) reload();
    if(!mesh || currentIndex!=op.index.get()) reload();
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

    if(cgl.frameStore.currentScene && cgl.frameStore.currentScene.getValue() && op.index.get()>=0)
    {
        op.uiAttr({warning:''});
        op.uiAttr({info:''});

        var jsonMesh=null;

        currentIndex=op.index.get();

        if(isNumeric(op.index.get()))
        {
            if(op.index.get()<0 || op.index.get()>=cgl.frameStore.currentScene.getValue().meshes.length)
            {
                op.uiAttr({warning:'mesh not found - index out of range '});
                return;
            }

            jsonMesh=cgl.frameStore.currentScene.getValue().meshes[parseInt(op.index.get(),10) ];
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
        geom.verticesIndices=[].concat.apply([], jsonMesh.faces);

        var nfo='';
        nfo += (geom.verticesIndices.length/3)+' faces <br/>';
        nfo += (geom.vertices.length/3)+' vertices <br/>';
        nfo += geom.texCoords.length+' texturecoords <br/>';
        nfo += geom.tangents.length+' tangents <br/>';
        nfo += geom.biTangents.length+' biTangents <br/>';
        if(geom.vertexNormals) nfo += geom.vertexNormals.length+' normals <br/>';
        
        op.uiAttr({"info":nfo});

        geometryOut.set(null);
        geometryOut.set(geom);
        mesh=new CGL.Mesh(cgl,geom);
    }
}

centerPivot.onValueChanged=function()
{
    mesh=null;
};
