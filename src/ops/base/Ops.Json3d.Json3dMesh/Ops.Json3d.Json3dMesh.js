
op.name="Json3dMesh";
var cgl=this.patch.cgl;

var scene=new CABLES.Variable();

cgl.frameStore.currentScene=null;

var exe=op.inFunction("Render");
var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var meshIndex=op.inValueInt("Mesh Index",0);


var draw=op.inValueBool("Draw",true);
var centerPivot=op.inValueBool("Center Mesh",true);
var inSize=op.inValue("Size",1);

var next=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var geometryOut=op.outObject("Geometry");


exe.onTriggered=render;
filename.onChange=reload;
meshIndex.onChange=setMesh;
inSize.onChange=updateScale;

var data=null;
var mesh=null;
var currentIndex=-1;
var transMatrix=mat4.create();
var bounds={};
var vScale=vec3.fromValues(1,1,1);

function render()
{
    if(draw.get())
    {
        cgl.pushMvMatrix();
        mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);

        if(mesh) mesh.render(cgl.getShader());
        next.trigger();
        cgl.popMvMatrix();
    }
}


function updateScale()
{
    if(inSize.get()!==0)
    {
        var scale=inSize.get()/bounds.maxAxis;
        vec3.set(vScale,scale,scale,scale);
    }
    else
    {
        vec3.set(vScale,1,1,1);
    }

    mat4.identity(transMatrix);
    mat4.scale(transMatrix,transMatrix, vScale);

}

function updateInfo(geom)
{
    if(!CABLES.UI)return;
    

    var nfo='<div class="panel">';
    

    if(data)
    {
        nfo += 'Mesh '+(currentIndex+1)+' of '+data.meshes.length+'<br/>';
        nfo += '<br/>';
    }
    
    if(geom)
    {
        nfo += geom.verticesIndices.length+' faces <br/>';
        nfo += geom.vertices.length+' vertices <br/>';
        nfo += geom.texCoords.length+' texturecoords <br/>';
        if(geom.vertexNormals) nfo += geom.vertexNormals.length+' normals <br/>';
    }
    
    nfo+="</div>";
    
    op.uiAttr({info:nfo});

}


function setMesh()
{
    mesh=null;
    var index=Math.floor(meshIndex.get());

    if(!data || index!=index || !isNumeric(index) || index<0 || index>=data.meshes.length)
    {
        op.uiAttr({warning:'mesh not found - index out of range '});
        return;
    }

    currentIndex=index;

    jsonMesh=data.meshes[index];

    if(!jsonMesh)
    {
        mesh=null;
        op.uiAttr({warning:'mesh not found'});
        return;
    }
    op.uiAttribs.warning='';

    var i=0;

    var geom=new CGL.Geometry();
    geom.vertices=JSON.parse(JSON.stringify(jsonMesh.vertices));
    geom.vertexNormals=jsonMesh.normals||[];
    geom.tangents=jsonMesh.tangents||[];
    geom.biTangents=jsonMesh.bitangents||[];
    
    if(centerPivot.get())geom.center();

    if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];
    geom.verticesIndices=[];
    geom.verticesIndices=[].concat.apply([], jsonMesh.faces);

    updateInfo();

    bounds=geom.getBounds();
    updateScale();
    updateInfo(geom);

    geometryOut.set(geom);
    mesh=new CGL.Mesh(cgl,geom);

    op.uiAttr({'warning':null});

}

function reload()
{
    if(!filename.get())return;
    currentIndex=-1;

    function doLoad()
    {
        CABLES.ajax(
            op.patch.getFilePath(filename.get()),
            function(err,_data,xhr)
            {
                if(err)
                {
                    if(CABLES.UI)op.uiAttr({'error':'could not load file...'});

                    console.error('ajax error:',err);
                    op.patch.loading.finished(loadingId);
                    return;
                }
                else
                {
                    if(CABLES.UI)op.uiAttr({'error':null});

                }

                try
                {
                    data=JSON.parse(_data);
                }
                catch(ex)
                {
                    if(CABLES.UI)op.uiAttr({'error':'could not load file...'});
                    return;

                }

                setMesh(meshIndex.get());

                render();
                op.patch.loading.finished(loadingId);
                if(CABLES.UI) gui.jobs().finish('loading3d'+loadingId);

            });
    }

    var loadingId=op.patch.loading.start('json3dFile',filename.get());

    if(CABLES.UI) gui.jobs().start({id:'loading3d'+loadingId,title:'loading 3d data'},doLoad);
        else doLoad();


}