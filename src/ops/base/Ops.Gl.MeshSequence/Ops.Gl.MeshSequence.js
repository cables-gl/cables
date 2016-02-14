CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='Mesh Sequence';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION ));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));


var index=this.addInPort(new Port(this,"index",OP_PORT_TYPE_VALUE));

var mesh=null;
var currentIndex=-1;

function doRender()
{
    if(mesh!==null) mesh.render(cgl.getShader());

    trigger.trigger();
}

var data=null;

function updateGeom(step)
{
    currentIndex=step;
    var jsonMesh=data.meshes[step];
    geom.vertices=jsonMesh.vertices;
    geom.vertexNormals=jsonMesh.normals;
    geom.tangents=jsonMesh.tangents;
    geom.biTangents=jsonMesh.bitangents;
     if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];
    geom.verticesIndices=[];

    geom.verticesIndices=[].concat.apply([], jsonMesh.faces);
}

index.onValueChanged=function()
{
    var n=Math.floor(index.get());
    if(n<0)n=0;
    if(n>=data.meshes.length)n=data.meshes.length-1;
    updateGeom(n);
    mesh.setGeom(geom);
};

var geom=null;

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

    
    
            updateGeom(5);
    
            var nfo='';
            nfo += geom.verticesIndices.length+' faces <br/>';
            nfo += geom.vertices.length+' vertices <br/>';
            nfo += geom.texCoords.length+' texturecoords <br/>';
            nfo += geom.vertexNormals.length+' normals <br/>';
            self.uiAttr({info:nfo});
    
            mesh=new CGL.Mesh(cgl,geom);


            console.log('data.meshes',data.meshes.length);
            
            self.uiAttribs.info='num meshes: '+data.meshes.length;

            self.patch.loading.finished(loadingId);

        });

}


filename.onValueChanged=reload;
render.onTriggered=doRender;