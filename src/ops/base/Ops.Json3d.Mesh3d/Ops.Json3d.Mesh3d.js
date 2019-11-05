const
    exe=op.inTrigger("Render"),
    filename=op.inUrl("file",'3d json'),
    meshIndex=op.inValueInt("Mesh Index",0),
    inNormals=op.inSwitch("Calculate Normals",["no","smooth","flat"],"no"),
    inResize=op.inBool("Resize",true),
    inSize=op.inValue("New Size",1),
    centerPivot=op.inValueBool("Center",true),
    merge=op.inValueBool("Merge All",false),
    next=op.outTrigger("trigger"),
    draw=op.inValueBool("Draw",true),
    geometryOut=op.outObject("Geometry"),
    outScale=op.outValue("Scaling",1.0),
    outName=op.outString("Mesh Name");

op.setPortGroup("Geometry",[centerPivot,merge,inNormals,inSize,inResize]);

const cgl=op.patch.cgl;
var scene=new CABLES.Variable();

var origVerts=[];
var geom=null;
var data=null;
var mesh=null;
var meshes=[];
var currentIndex=-1;
var bounds={};
var needSetMesh=true;
var hasError=false;

op.preRender=
    exe.onTriggered=render;

filename.onChange=
    inNormals.onChange=reload;

centerPivot.onChange=
    inSize.onChange=
    meshIndex.onChange=
    merge.onChange=setMeshLater;

inResize.onChange=
    merge.onChange=updateResizeUi;


function getMeshName(idx)
{

    if(data && data.meshes && data.meshes[idx] && data.meshes[idx].name)return data.meshes[idx].name;

    if(data && data.rootnode && data.rootnode.children && data.rootnode.children.length>idx-1)
    {
        for(var i=0;i<data.rootnode.children.length;i++)
        {
            if(data.rootnode.children[i].meshes && data.rootnode.children[i].meshes.length==1 && data.rootnode.children[i].meshes[0]==idx) return data.rootnode.children[i].name;
        }

    }


    return "unknown";
}

function updateResizeUi()
{
    inSize.setUiAttribs({greyout:!inResize.get()});
    meshIndex.setUiAttribs({greyout:merge.get()});
    setMeshLater();
}

function calcNormals()
{
    if(!geom)
    {
        console.log('calc normals: no geom!');
        return;
    }

    if(inNormals.get()=='smooth')geom.calculateNormals();
    else if(inNormals.get()=='flat')
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
        if(mesh) mesh.render(cgl.getShader());
        next.trigger();
    }
}

function setMeshLater()
{
    needSetMesh=true;
}

function updateScale()
{
    if(!geom) return;

    if(inResize.get())
    {
        var scale=inSize.get()/bounds.maxAxis;
        for(var i=0;i<geom.vertices.length;i++)geom.vertices[i]*=scale;
        outScale.set(scale);
    }
    else
    {
        outScale.set(1);
    }
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
    if(mesh)
    {
        mesh.dispose();
        mesh=null;
    }

    var index=Math.floor(meshIndex.get());

    if(!data || index!=index || !CABLES.UTILS.isNumeric(index) || index<0 || index>=data.meshes.length)
    {
        op.uiAttr({'warning':'mesh not found - index out of range / or no file selected '});
        meshes[index]=null;
        hasError=true;
        outName.set("");
        return;
    }
    else
    {
        if(hasError)
        {
            op.uiAttr({'warning':null});
            hasError=false;
        }
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
        outName.set(getMeshName(""));
    }
    else
    {
        var jsonGeom=data.meshes[index];

        outName.set(getMeshName(index));

        if(!jsonGeom)
        {
            mesh=null;
            op.uiAttr({warning:'mesh not found'});
            return;
        }

        geom=CGL.Geometry.json2geom(jsonGeom);
    }

    if(centerPivot.get())geom.center();

    bounds=geom.getBounds();
    updateScale();
    updateInfo(geom);

    if(inNormals.get()!='no')calcNormals();
    geometryOut.set(null);
    geometryOut.set(geom);

    if(mesh)mesh.dispose();

    mesh=new CGL.Mesh(cgl,geom);
    needSetMesh=false;
    meshes[index]=mesh;

    op.uiAttr({'warning':null});
}

function reload()
{
    if(!filename.get())return;
    currentIndex=-1;

    console.log("reload",filename.get());

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
    }

    var loadingId=op.patch.loading.start('json3dMesh',filename.get());

    if(CABLES.UI) gui.jobs().start({id:'loading3d'+loadingId,title:'loading 3d data'},doLoad);
        else doLoad();
}
