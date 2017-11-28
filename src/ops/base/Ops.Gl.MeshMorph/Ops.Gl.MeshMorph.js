op.name="MeshMorph";
var cgl=op.patch.cgl;


var render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION ));

var nextGeom=op.inValueInt("Geometry");
var duration=op.inValue("Duration",1.0);

var finished=op.outValue("Finished");

var mesh=null;
var inGeoms=[];
nextGeom.onChange=updateGeom;

var oldGeom=0;
var anim=new CABLES.TL.Anim();
anim.clear();


for(var i=0;i<8;i++)
{
    var inGeom=op.inObject("Geometry "+(i));
    inGeom.onChange=updateMeshes;
    inGeoms.push(inGeom);
}

function updateMeshes()
{
    if(mesh)return;
    for(var i=0;i<inGeoms.length;i++)
    {
        var geom=inGeoms[i].get();
        if(geom && geom._vertices)
        {
            op.log(i+" verts",geom._vertices.length);

            if(i===0)
            {
                mesh=new CGL.Mesh(cgl,geom);
                
                mesh.addAttribute(prfx+'_attrMorphTargetA',geom._vertices,3);
                mesh.addAttribute(prfx+'_attrMorphTargetB',geom._vertices,3);
                op.log("MESH BUILD");
                updateGeom();
            }
        }
    }
}

function updateGeom()
{
    op.log("update geom");
    if(oldGeom==nextGeom.get())return;
    
    anim.clear();
    anim.setValue(op.patch.freeTimer.get(), 0);
    anim.setValue(op.patch.freeTimer.get()+duration.get(), 1,
        function()
        {
            op.log("finished");
            oldGeom=nextGeom.get();
            finished.set(true);
        });
    finished.set(false);

    var geom1=inGeoms[oldGeom].get();
    var geom2=inGeoms[nextGeom.get()].get();
    
    // op.log("from toooooooo ",oldGeom,nextGeom.get());
    
    if(mesh && geom1 && geom2 && geom1._vertices && geom2._vertices)
    {
        mesh.updateAttribute(prfx+'_attrMorphTargetB',geom1._vertices);
        mesh.updateAttribute(prfx+'_attrMorphTargetA',geom2._vertices);
    }

}


var trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var calcVertexNormals=op.addInPort(new Port(this,"smooth",OP_PORT_TYPE_VALUE,{'display':'bool'} ));
calcVertexNormals.set(true);

var geoms=[];
var mesh=null;
window.meshsequencecounter=window.meshsequencecounter||1;
window.meshsequencecounter++;
var prfx=String.fromCharCode(97 + window.meshsequencecounter);
var needsUpdateFrame=false;
render.onTriggered=doRender;

var srcHeadVert=''
    .endl()+'IN vec3 '+prfx+'_attrMorphTargetA;'
    .endl()+'IN vec3 '+prfx+'_attrMorphTargetB;'
    .endl()+'UNI float {{mod}}_fade;'
    .endl()+'UNI float {{mod}}_doMorph;'
    .endl();

var srcBodyVert=''
    // .endl()+'   pos =vec4(vPosition,1.0);'
    .endl()+' if({{mod}}_doMorph==1.0){'
    .endl()+'   pos = vec4( '+prfx+'_attrMorphTargetA * {{mod}}_fade + '+prfx+'_attrMorphTargetB * (1.0 - {{mod}}_fade ), 1. );'
    .endl()+' }'
    .endl();

var uniFade=null;
var module=null;
var shader=null;
var uniDoMorph=null;

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

        uniFade=new CGL.Uniform(shader,'f',module.prefix+'_fade',0);
        uniDoMorph=new CGL.Uniform(shader,'f',module.prefix+'_doMorph',1);
    }

    if(uniDoMorph)
    {
        uniFade.setValue(anim.getValue(op.patch.freeTimer.get()));

        uniDoMorph.setValue(1.0);
        if(mesh!==null) mesh.render(cgl.getShader());
        uniDoMorph.setValue(0);
        trigger.trigger();
    }

}

