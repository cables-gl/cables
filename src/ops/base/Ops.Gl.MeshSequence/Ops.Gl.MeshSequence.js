var self=this;
var cgl=this.patch.cgl;

this.name='Mesh Sequence';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION ));
var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var frame=this.addInPort(new Port(this,"frame",OP_PORT_TYPE_VALUE ));
frame.set(0);
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var calcVertexNormals=this.addInPort(new Port(this,"smooth",OP_PORT_TYPE_VALUE,{'display':'bool'} ));
calcVertexNormals.set(true);

var geoms=[];
var mesh=null;

var srcHeadVert=''
    .endl()+'attribute vec3 attrMorphTargetA;'
    .endl()+'attribute vec3 attrMorphTargetB;'
    .endl()+'uniform float {{mod}}_fade;'
    .endl();

var srcBodyVert=''
    // .endl()+'   pos =vec4(vPosition,1.0);'
    .endl()+'   pos = vec4( attrMorphTargetA * {{mod}}_fade + attrMorphTargetB * (1.0 - {{mod}}_fade ), 1. );'
    // .endl()+'   pos = vec4( attrMorphTargetA * {{mod}}_fade + vPosition * (1.0 - {{mod}}_fade ), 1. );'
    // .endl()+'   norm = (attrMorphTargetB * {{mod}}_fade + norm * (1.0 - {{mod}}_fade ) );'
    .endl();

var uniFade=null;
var module=null;
var shader=null;
var lastFrame=0;

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

        uniFade=new CGL.Uniform(shader,'f',module.prefix+'_fade',fade);
    }

    uniFade.setValue(fade);

    if(mesh!==null) mesh.render(cgl.getShader());
    trigger.trigger();
}


function updateFrame()
{
    if(mesh && geoms.length>0)
    {
        var n=Math.floor(frame.get());
        if(n<0)n=0;
        n=n%(geoms.length-1);

        if(n+1>geoms.length-1) n=0;


        if(n!=lastFrame)
        {
            mesh.updateAttribute('attrMorphTargetA',geoms[n+1].vertices);
            // mesh.updateAttribute('attrMorphTargetAN',geoms[n].vertexNormals);
            
            mesh.updateAttribute('attrMorphTargetB',geoms[n].vertices);
            // mesh.updateAttribute('attrMorphTargetB',geoms[n].vertexNormals);

            lastFrame=n;
        }
    }
}

function reload()
{
    if(!filename.get())return;

    var loadingId=self.patch.loading.start('json mesh sequence',filename.get());

    
    lastFrame=0;
    
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

            var data=JSON.parse(_data);

            geoms.length=0;

            for(var i=0;i<data.meshes.length;i++)
            {
                var geom=new CGL.Geometry();
                
                geom.verticesIndices=[];
                geom.verticesIndices=[].concat.apply([], data.meshes[0].faces);
                geom.vertices=data.meshes[i].vertices;
                geom.texCoords=data.meshes[i].texturecoords;

                if(calcVertexNormals.get())
                {
                    geom.calcNormals(true);
                }
                else
                {
                    geom.unIndex();
                    geom.calcNormals(false);
                }

                geoms.push(geom);
            }

            mesh=new CGL.Mesh(cgl,geoms[0]);
            mesh.addAttribute('attrMorphTargetA',geoms[0].vertices,3);
            mesh.addAttribute('attrMorphTargetB',geoms[0].vertexNormals, 3);
            
            self.uiAttribs.info='num frames: '+data.meshes.length;
            self.patch.loading.finished(loadingId);

        });
}


frame.onValueChange(updateFrame);
filename.onValueChange(reload);
render.onTriggered=doRender;
calcVertexNormals.onValueChange(reload);