op.name="ForceMeshDeformer";

var render=op.inFunction("Render");

var inSmooth=op.inValueBool("Smooth",true);
var next=op.outFunction("Next");

var cgl=op.patch.cgl;
var shaderModule=null;
var shader=null;

var id=CABLES.generateUUID();

var lastTime=0;
var mark=new CGL.Marker(cgl);
var needsRebuild=false;

var numForces=0;
var forceUniforms=[];
var firstTime=true;




var uniTime=null;
var uniSize=null;
var uniTimeDiff=null;
var uniPos=null;
var uniLifetime=null;
var uniFadeInOut=null;

render.onTriggered=function()
{
    if(needsRebuild)doReset();
    var time=op.patch.freeTimer.get();
    var timeDiff=time-lastTime;

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        shader.glslVersion=300;
        shaderModule=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.deformer_head_vert,
                srcBodyVert:attachments.deformer_vert
            });

        uniTime=new CGL.Uniform(shader,'f',shaderModule.prefix+'time',0);
        // uniPos=new CGL.Uniform(shader,'3f',shaderModule.prefix+'emitterPos',0);
        // uniSizeX=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeX',inSizeX.get());
        // uniSizeY=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeY',inSizeY.get());
        // uniSizeZ=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeZ',inSizeZ.get());
        // uniTimeDiff=new CGL.Uniform(shader,'f',shaderModule.prefix+'timeDiff',0);
        // uniLifetime=new CGL.Uniform(shader,'f',shaderModule.prefix+'lifeTime',lifetime);
        // uniFadeInOut=new CGL.Uniform(shader,'f',shaderModule.prefix+'fadeinout',fadeInOut);
        
        uniSmooth=new CGL.Uniform(shader,'f',shaderModule.prefix+'smooth',inSmooth);
                    
    }
    
    if(!shader)return;

    for(var i=0;i<CABLES.forceFieldForces.length;i++)
    {
        var force=CABLES.forceFieldForces[i];
        if(force)
        if(!force.hasOwnProperty(id+"uniRange"))
        {
            force[id+'uniRange']=new CGL.Uniform(shader,'f','forces['+i+'].range',force.range);
            force[id+'uniAttraction']=new CGL.Uniform(shader,'f','forces['+i+'].attraction',force.attraction);
            force[id+'uniAngle']=new CGL.Uniform(shader,'f','forces['+i+'].angle',force.angle);
            force[id+'uniPos']=new CGL.Uniform(shader,'3f','forces['+i+'].pos',force.pos);
            force[id+'uniTime']=new CGL.Uniform(shader,'f','forces['+i+'].time',time);
        }
        else
        {
            force[id+'uniRange'].setValue(force.range);
            force[id+'uniAttraction'].setValue(force.attraction);
            force[id+'uniAngle'].setValue(force.angle);
            force[id+'uniPos'].setValue(force.pos);
            force[id+'uniTime'].setValue(time);
        }
    }

    lastTime=op.patch.freeTimer.get();
    
next.trigger();    
  

};



function removeModule()
{
    if(shader && shaderModule)
    {
        shader.removeModule(shaderModule);
        shader=null;
    }
}
render.onLinkChanged=removeModule;

