var cgl=this.patch.cgl;

var scene=new CABLES.Variable();

cgl.frameStore.currentScene=null;

var exe=op.inFunction("Render");
var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'3d json' } ));
var meshIndex=op.inValueInt("Mesh Index",0);


var draw=op.inValueBool("Draw",true);
var centerPivot=op.inValueBool("Center Mesh",true);


var inSize=op.inValue("Size",1);

var next=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var geometryOut=op.outObject("Geometry");

var merge=op.inValueBool("Merge",false);

var inNormals=op.inValueSelect("Calculate Normals",["no","smooth","flat"],"no");
var outScale=op.outValue("Scaling",1.0);

var geom=null;
var data=null;
var mesh=null;
var meshes=[];
var currentIndex=-1;
var transMatrix=mat4.create();
var bounds={};
var vScale=vec3.fromValues(1,1,1);

exe.onTriggered=render;
filename.onChange=reload;
centerPivot.onChange=setMeshLater;
meshIndex.onChange=setMeshLater;
inNormals.onChange=setMeshLater;
merge.onChange=setMeshLater;

inSize.onChange=updateScale;
var needSetMesh=true;


function calcNormals()
{
    if(!geom)
    {
        console.log('calc normals: no geom!');
        return;
    }

    if(inNormals.get()=='no')return;
    if(inNormals.get()=='smooth')geom.calculateNormals();
    if(inNormals.get()=='flat')
    {
        geom.unIndex();
        geom.calculateNormals();
    }
}

function render()
{
    if(needSetMesh) setMesh();

    if(draw.get())
    {
        cgl.pushModelMatrix();
        mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);

        if(mesh) mesh.render(cgl.getShader());
        
        cgl.popModelMatrix();
        next.trigger();
    }
}

function setMeshLater()
{
    needSetMesh=true;
}


function updateScale()
{
    if(inSize.get()!==0)
    {
        var scale=inSize.get()/bounds.maxAxis;
        vec3.set(vScale,scale,scale,scale);
        outScale.set(scale);
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
        nfo += (geom.verticesIndices||[]).length/3+' faces <br/>';
        nfo += (geom.vertices||[]).length/3+' vertices <br/>';
        nfo += (geom.texCoords||[]).length/2+' texturecoords <br/>';
        nfo += (geom.vertexNormals||[]).length/3+' normals <br/>';
        nfo += (geom.tangents||[]).length/3+' tangents <br/>';
        nfo += (geom.biTangents||[]).length/3+' bitangents <br/>';
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

    geom=new CGL.Geometry();

    if(merge.get())
    {
        for(var i=0;i<data.meshes.length;i++)
        {
            var jsonGeom=data.meshes[i];
            if(jsonGeom)
            {
                var geomNew=CGL.Geometry.json2geom(jsonGeom);
                geom.merge(geomNew);
            }
        }
        
        var bnd=geom.getBounds();
        
        for(var i=0;i<geom.vertices.length;i++)
        {
            geom.vertices[i]/=bnd.maxAxis;
        }
        

    }
    else
    {
        var jsonGeom=data.meshes[index];

        if(!jsonGeom)
        {
            mesh=null;
            op.uiAttr({warning:'mesh not found'});
            return;
        }

        var i=0;
        geom=CGL.Geometry.json2geom(jsonGeom);
        
        
    }

    if(centerPivot.get())geom.center();

    bounds=geom.getBounds();
    updateScale();
    updateInfo(geom);

    calcNormals();
    geometryOut.set(geom);
    mesh=new CGL.Mesh(cgl,geom);
    needSetMesh=false;
    meshes[index]=mesh;
    
    // console.log("set mesh done");
    // console.log(geom);

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
                    op.patch.loading.finished(loadingId);
                    return;
                }

                needSetMesh=true;
                op.patch.loading.finished(loadingId);
                if(CABLES.UI) gui.jobs().finish('loading3d'+loadingId);

            });
        // setMesh();
    }

    var loadingId=op.patch.loading.start('json3dMesh',filename.get());

    if(CABLES.UI) gui.jobs().start({id:'loading3d'+loadingId,title:'loading 3d data'},doLoad);
        else doLoad();
}