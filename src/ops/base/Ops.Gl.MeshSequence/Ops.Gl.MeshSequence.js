var self=this;
var cgl=this.patch.cgl;

this.name='Mesh Sequence';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION ));
var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var frame=this.addInPort(new Port(this,"frame",OP_PORT_TYPE_VALUE ));
frame.set(0);
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var mesh=null;
var data=null;
var geom=null;

function doRender()
{
    if(mesh!==null) mesh.render(cgl.getShader());
    trigger.trigger();
}

function updateGeom(step)
{
    // todo: in mesh: just update the needed data.

    var jsonMesh=data.meshes[step];
    geom.vertices=jsonMesh.vertices;
    geom.vertexNormals=jsonMesh.normals;
    geom.tangents=jsonMesh.tangents;
    geom.biTangents=jsonMesh.bitangents;
}

function updateFrame()
{
    if(mesh)
    {
        var n=Math.floor(frame.get());
    
        if(n<0)n=0;
        if(n>=data.meshes.length)n=n%(data.meshes.length);
        updateGeom(n);
        mesh.setGeom(geom);
    }
}

function reload()
{
    if(!filename.get())return;

    var loadingId=self.patch.loading.start('json mesh sequence',filename.get());

    CABLES.ajax(
        self.patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            if(err)
            {
                console.log('ajax error:',err);
                self.patch.loading.finished(loadingId);
                return;
            }

            data=JSON.parse(_data);

            geom=new CGL.Geometry();
            updateGeom( 0 );
            
            
            var jsonMesh=data.meshes[0];
            if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];
            geom.verticesIndices=[];
            geom.verticesIndices=[].concat.apply([], jsonMesh.faces);

            mesh=new CGL.Mesh(cgl,geom);
            if(frame.get()!==0)updateGeom( Math.floor(frame.get()) );

            self.uiAttribs.info='num frames: '+data.meshes.length;
            self.patch.loading.finished(loadingId);

        });
}


frame.onValueChange(updateFrame);
filename.onValueChange(reload);
render.onTriggered=doRender;

