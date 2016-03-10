var self=this;
var cgl=this.patch.cgl;

this.name='Mesh Sequence';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION ));
var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var frame=this.addInPort(new Port(this,"frame",OP_PORT_TYPE_VALUE ));
frame.set(0);
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var calcVertexNormals=this.addInPort(new Port(this,"smooth",OP_PORT_TYPE_VALUE,{'display':'bool'} ));


var mesh=null;
var data=null;
var geom=null;

var srcHeadVert=''
    .endl()+'attribute vec3 attrMorphTargetA;'
    .endl()+'attribute vec3 attrMorphTargetB;'
    .endl()+'uniform float {{mod}}_fade;'
    .endl();

var srcBodyVert=''
    .endl()+'   pos = vec4( attrMorphTargetA * {{mod}}_fade + vPosition * (1.0 - {{mod}}_fade ), 1. );'
    .endl()+'   norm = (attrMorphTargetB * {{mod}}_fade + norm * (1.0 - {{mod}}_fade ) );'
    
    // attrVertNormal
    // .endl()+'   pos = vec4( attrMorphTargetA,1.0  );'
    .endl();

var uniFade=null;
var module=null;
var shader=null;
var nextGeoms=null;

function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader=null;
    }
}

function doRender()
{
    var fade=frame.get()%1;
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();

        shader=cgl.getShader();

        module=shader.addModule(
            {
                name: 'MODULE_VERTEX_POSITION',
                srcHeadVert: srcHeadVert,
                srcBodyVert: srcBodyVert
            });

        console.log('morph module inited');

        uniFade=new CGL.Uniform(shader,'f',module.prefix+'_fade',fade);
    }

    uniFade.setValue(fade);

    if(mesh!==null) mesh.render(cgl.getShader());
    trigger.trigger();
}

var lastFrame=-1;

function updateGeom(step)
{
    // todo: in mesh: just update the needed data.
    var jsonMesh=data.meshes[step];
    geom.vertices=jsonMesh.vertices;

    geom.texCoords=[];
    for(var i=0;i<geom.vertices/3;i++)
    {
        geom.texCoords.push(0);
        geom.texCoords.push(0);
    }

    var next=step+1;
    if(next>data.meshes.length-1) next=0;

    if(geom.verticesIndices && geom.verticesIndices.length>0)
    {
        geom.calcNormals(calcVertexNormals.get());
    }

    // if(mesh)
    {
        // console.log(nextGeom.vertices);
    
        nextGeom.vertices=data.meshes[next].vertices;
        nextGeom.calcNormals(calcVertexNormals.get());
        
        if(mesh) mesh.updateAttribute('attrMorphTargetA',nextGeom.vertices);
        if(mesh) mesh.updateAttribute('attrMorphTargetB',nextGeom.vertexNormals);
    }

    // attrMorphNormalsA
}


function updateFrame()
{
    if(mesh)
    {
        var n=Math.floor(frame.get());
    
        if(n<0)n=0;
        if(n>=data.meshes.length)n=n%(data.meshes.length);
        
        if(n!=lastFrame)
        {
            updateGeom(n);
            lastFrame=n;
            mesh.setGeom(geom);
            mesh.addAttribute('attrMorphTargetA',nextGeom.vertices,3);
            mesh.addAttribute('attrMorphTargetB',nextGeom.vertexNormals, 3);
        }
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
            nextGeom=new CGL.Geometry();

            var jsonMesh=data.meshes[0];
            if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];
            geom.verticesIndices=[];
            geom.verticesIndices=[].concat.apply([], jsonMesh.faces);
            
            nextGeom.verticesIndices=[];
            nextGeom.verticesIndices=[].concat.apply([], jsonMesh.faces);
            
            updateGeom( 0 );

            mesh=new CGL.Mesh(cgl,geom);
            if(frame.get()!==0)updateGeom( Math.floor(frame.get()) );


            self.uiAttribs.info='num frames: '+data.meshes.length;
            self.patch.loading.finished(loadingId);

        });
}


frame.onValueChange(updateFrame);
filename.onValueChange(reload);
render.onTriggered=doRender;
