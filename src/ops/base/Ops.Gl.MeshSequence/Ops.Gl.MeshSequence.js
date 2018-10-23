var self=this;
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION ));
var filename=this.addInPort(new Port(this,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var frame=this.addInPort(new Port(this,"frame",CABLES.OP_PORT_TYPE_VALUE ));
frame.set(0);
var trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var calcVertexNormals=this.addInPort(new Port(this,"smooth",CABLES.OP_PORT_TYPE_VALUE,{'display':'bool'} ));
calcVertexNormals.set(true);

var doDraw=op.inValueBool("Render",true);

var outNumFrames=op.outValue("Num Frames");
var outName=op.outValue("Frame Name");

var outGeomA=op.outObject("Geometry A");
var outGeomB=op.outObject("Geometry B");
var geoms=[];
var mesh=null;
window.meshsequencecounter=window.meshsequencecounter||1;
window.meshsequencecounter++;
var prfx=String.fromCharCode(97 + window.meshsequencecounter);
var needsUpdateFrame=false;

var srcHeadVert=''
    .endl()+'IN vec3 '+prfx+'_attrMorphTargetA;'
    .endl()+'IN vec3 '+prfx+'_attrMorphTargetB;'
    // .endl()+'IN vec3 attrMorphTargetAN;'
    // .endl()+'IN vec3 attrMorphTargetBN;'
    .endl()+'uniform float {{mod}}_fade;'
    .endl()+'uniform float {{mod}}_doMorph;'
    .endl();

var srcBodyVert=''
    // .endl()+'   pos =vec4(vPosition,1.0);'
    .endl()+' if({{mod}}_doMorph==1.0){'
    .endl()+'   pos = vec4( '+prfx+'_attrMorphTargetA * {{mod}}_fade + '+prfx+'_attrMorphTargetB * (1.0 - {{mod}}_fade ), 1. );'
    // .endl()+'   pos = vec4( attrMorphTargetA * {{mod}}_fade + vPosition * (1.0 - {{mod}}_fade ), 1. );'
    // .endl()+'   norm = (attrMorphTargetBN * {{mod}}_fade + norm * (1.0 - {{mod}}_fade ) );'
    // .endl()+'   norm = vec3(attrMorphTargetAN * {{mod}}_fade + attrMorphTargetBN * (1.0 - {{mod}}_fade ) );'
    // .endl()+'   norm = attrMorphTargetAN;'
    .endl()+' }'
    .endl();

var uniFade=null;
var module=null;
var shader=null;
var lastFrame=0;
var needsReload=false;
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
    if(needsReload)reload();
    if(needsUpdateFrame)updateFrame();
    var fade=frame.get()%1;
    if(cgl.getShader() && cgl.getShader()!=shader)
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
        uniDoMorph=new CGL.Uniform(shader,'f',module.prefix+'_doMorph',0);
    }

    if(uniDoMorph)
    {
        uniFade.setValue(fade);
        uniDoMorph.setValue(1.0);
        if(doDraw.get() && mesh!==null) mesh.render(cgl.getShader());
        uniDoMorph.setValue(0);
        trigger.trigger();
    }
}




function updateFrameLater()
{
    needsUpdateFrame=true;
}

function updateFrame()
{
    if(mesh && geoms.length>0)
    {
        var n=Math.floor(frame.get());
        if(n<0)n=0;
        n=n%(geoms.length-1);

        if(n+1>geoms.length-1) n=0;

        if(n!=lastFrame && module && geoms[n+1])
        {
            if(doDraw.get())
            {
                mesh.updateAttribute(prfx+'_attrMorphTargetA',geoms[n+1].verticesTyped);
                mesh.updateAttribute(prfx+'_attrMorphTargetB',geoms[n].verticesTyped);
            }

            outGeomA.set(geoms[n]);
            outGeomB.set(geoms[n+1]);
            // mesh.updateAttribute('attrMorphTargetBN',geoms[n].vertexNormals);

            lastFrame=n;
        }
        outName.set(geoms[n].name);
    }
    needsUpdateFrame=false;
}

var uniDoMorph=null;
var loadingId=-1;



function reload()
{
    if(!filename.get() || filename.get()=='')return;

    needsReload=false;

    loadingId=op.patch.loading.start('json mesh sequence',filename.get());

    lastFrame=0;
    
    CABLES.ajax(
        op.patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            if(err)
            {
                if(CABLES.UI)self.uiAttr({"error":"file not found"});
                console.log('ajax error:',err);
                op.patch.loading.finished(loadingId);
                return;
            }
            else if(CABLES.UI)self.uiAttr({"error":null});

            var data=null;
            
            try
            {
                data=JSON.parse(_data);
            }
            catch(e)
            {
                if(CABLES.UI)self.uiAttr({"error":"could not load file..."});
                console.log("meshsequence could not load file..."+filename.get());
                return;
            }

            geoms.length=0;

            for(var i=0;i<data.meshes.length;i++)
            {
                var geom=new CGL.Geometry();
                
                geom.verticesIndices=[];
                geom.verticesIndices=[].concat.apply([], data.meshes[0].faces);
                geom.vertices=data.meshes[i].vertices;
                
                // console.log('seq verts:',geom.vertices.length);
                
                geom.texCoords=data.meshes[0].texturecoords;

                // console.log('seq texcoords:',geom.texCoords.length);
                // console.log('first texcoord:',data.meshes[0].texturecoords.length);

                if(calcVertexNormals.get())
                {
                    geom.calculateNormals();
                }
                else
                {
                    geom.unIndex();
                    geom.calculateNormals();
                }
                
                geom.name=data.meshes[i].name;
                
                geom.verticesTyped=new Float32Array( geom.vertices );

                geoms.push(geom);
            }

            rebuildMesh();
            outNumFrames.set(geoms.length);
            needsUpdateFrame=true;

            self.uiAttribs.info='num frames: '+data.meshes.length;

            op.patch.loading.finished(loadingId);
            loadingId=-1;

        });
}

function rebuildMesh()
{
    if(geoms.length>0)
    {
        geoms[0].calculateNormals();
    
        mesh=new CGL.Mesh(cgl,geoms[0]);
        mesh.addVertexNumbers=true;
        mesh.setGeom(geoms[0]);
        mesh.addAttribute(prfx+'_attrMorphTargetA',geoms[0].vertices,3);
        mesh.addAttribute(prfx+'_attrMorphTargetB',geoms[0].vertices,3);
        
    }
}


function reloadLater()
{
    needsReload=true;    
}


frame.onValueChange(updateFrameLater);
filename.onValueChange(reload);
render.onTriggered=doRender;
calcVertexNormals.onValueChange(rebuildMesh);