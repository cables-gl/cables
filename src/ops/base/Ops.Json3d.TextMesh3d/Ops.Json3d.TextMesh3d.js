
var exe=op.inFunction("Render");
var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'mesh' } ));
var text=op.inValueString("Text","cables");
var inSize=op.inValue("Depth",0.2);
var inSpace=op.inValue("Spacing",0.1);

var next=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var geometryOut=op.outObject("Geometry");
var outWidth=op.outValue("Width");

var data=null;
var meshes={};
var transMatrix=mat4.create();
var vScale=vec3.fromValues(1,1,1);

exe.onTriggered=render;
filename.onChange=reload;
inSize.onChange=updateScale;

var vec=vec3.create();
vec3.set(vec,1,0,0);

var cgl=this.patch.cgl;

function render()
{
    cgl.pushModelMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);

    var txt=text.get()||'';
    var lastWidth=0;
    var width=0;

    cgl.pushModelMatrix();
    for(var i=0;i<txt.length;i++)
    {
        if(txt[i]==' ')
        {
            vec[0]=0.4;
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        }
        else if(meshes[txt[i]])
        {
            var m=meshes[txt[i]];
            if(m)
            {
                vec[0]=lastWidth;
                mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
                
                // cgl.pushModelMatrix();
                // mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,m.charTrans);
                
                m.render(cgl.getShader());
                // cgl.popModelMatrix();
                
                width+=lastWidth;
                lastWidth=m.charWidth+inSpace.get();
            }
        }
        
    }
    width+=lastWidth-inSpace.get();;


    outWidth.set(width);
    
    cgl.popModelMatrix();
    cgl.popModelMatrix();
    next.trigger();
}

function updateScale()
{

    vec3.set(vScale,1,1,inSize.get());
    mat4.identity(transMatrix);
    mat4.scale(transMatrix,transMatrix, vScale);
}

function addMesh(jsonMesh)
{
    if(!jsonMesh || !jsonMesh.name)return;
    var index=jsonMesh.name;  

    if(!jsonMesh)
    {
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
    
    if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];

    // geom.center();
    geom.verticesIndices=[];
    geom.verticesIndices.length=jsonMesh.faces.length*3;

    for(i=0;i<jsonMesh.faces.length;i++)
    {
        geom.verticesIndices[i*3]=jsonMesh.faces[i][0];
        geom.verticesIndices[i*3+1]=jsonMesh.faces[i][1];
        geom.verticesIndices[i*3+2]=jsonMesh.faces[i][2];
    }

    var bounds=geom.getBounds();
    

    // var offset=
    //     [
    //         bounds.minX+(bounds.maxX-bounds.minX)/2,
    //         bounds.minY+(bounds.maxY-bounds.minY)/2,
    //         bounds.minZ+(bounds.maxZ-bounds.minZ)/2
    //     ];

    for(i=0;i<geom.vertices.length;i+=3)
    {
        // if(geom.vertices[i+0]==geom.vertices[i+0])
        {
            geom.vertices[i+0]-=bounds.minX;
            geom.vertices[i+1]-=bounds.minY;
            geom.vertices[i+2]-=bounds.minZ;
            // geom.vertices[i+1]-=offset[1];
            // geom.vertices[i+2]-=offset[2];
        }
    }
    
    
    
    var mesh=new CGL.Mesh(cgl,geom);
    mesh.charWidth=Math.abs(bounds.maxX-bounds.minX);
    mesh.charTrans=jsonMesh.charTrans;
    console.log(index,mesh.charWidth);

    meshes[index]=mesh;
    

    op.uiAttr({'warning':null});
}

function reload()
{
    if(!filename.get())return;

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

                for(var i=0;i<data.rootnode.children.length;i++)
                {
                    if(data.rootnode.children[i].meshes && data.rootnode.children[i].meshes.length>0)
                    {
                        var meshIndex=data.rootnode.children[i].meshes[0];
                        data.meshes[meshIndex].name=data.rootnode.children[i].name;
                        data.meshes[meshIndex].charTrans=data.rootnode.children[i].transformation;
                        mat4.transpose(data.meshes[meshIndex].charTrans,data.meshes[meshIndex].charTrans);
                        console.log(data.meshes[meshIndex].charTrans);
                        
                        addMesh(data.meshes[meshIndex]);
                    }
                }

                updateScale();
                op.patch.loading.finished(loadingId);
                if(CABLES.UI) gui.jobs().finish('loading3d'+loadingId);

            });
    }

    var loadingId=op.patch.loading.start('json3dFile',filename.get());

    if(CABLES.UI) gui.jobs().start({id:'loading3d'+loadingId,title:'loading 3d data'},doLoad);
        else doLoad();
}