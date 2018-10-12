op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inSize=op.inValue("Size",1);
var inOffset=op.inValue("offset");
var inPoints=op.inArray("Points");

var cgl=op.patch.cgl;
var shader=null;
var updateUniformPoints=true;
var pointArray=new Float32Array(99);
var srcHeadVert=attachments.splinedeform_head_vert||'';
var srcBodyVert=attachments.splinedeform_vert||'';

var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

inPoints.onChange=function()
{
    if(inPoints.get())
    {
        pointArray=inPoints.get();
        updateUniformPoints=true;
        // console.log(inPoints.get().length,"points");
    }
};

op.render.onLinkChanged=removeModule;
var ready=false;
op.render.onTriggered=function()
{
    if(!cgl.getShader())
    {
         op.trigger.trigger();
         return;
    }

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        inOffset.offset=new CGL.Uniform(shader,'f',moduleVert.prefix+'offset',inOffset);

        op.uniPoints=new CGL.Uniform(shader,'3f[]',moduleVert.prefix+'points',new Float32Array([0,0,0,0,0,0]));
        ready=false;
        updateUniformPoints=true;
    }
    
    if(shader && updateUniformPoints && pointArray && pointArray.length>=3)
    {
        if(shader.getDefine("SPLINE_POINTS")!=Math.floor(pointArray.length/3))
        {
            shader.define('SPLINE_POINTS',Math.floor(pointArray.length/3));
            // console.log('SPLINE_POINTS',shader.getDefine("SPLINE_POINTS"));
        }

        op.uniPoints.setValue(pointArray);
        updateUniformPoints=false;
        ready=true;
    }

    if(!shader || !ready)return;

    op.trigger.trigger();
};
