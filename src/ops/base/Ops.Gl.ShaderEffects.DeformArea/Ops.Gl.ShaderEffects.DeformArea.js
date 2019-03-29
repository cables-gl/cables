const render=op.inTrigger("render");
const next=op.outTrigger("trigger");
const inSize=op.inValue("Size",1);
const inStrength=op.inValue("Strength",0.5);
const inSmooth=op.inValueBool("Smooth",true);
const inWorldSpace=op.inValueBool("WorldSpace",false);
const x=op.inValue("x");
const y=op.inValue("y");
const z=op.inValue("z");

const cgl=op.patch.cgl;

inWorldSpace.onChange=updateWorldspace;

var shader=null;
var srcHeadVert=attachments.deformarea_vert;
render.onLinkChanged=removeModule;

var srcBodyVert=''
    .endl()+'pos=MOD_deform(pos,mMatrix);'
    .endl();

var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

render.onTriggered=function()
{
    if(CABLES.UI)
    {
        if(gui.patch().isCurrentOp(op)) gui.setTransformGizmo({posX:x,posY:y,posZ:z});

        if(CABLES.UI.renderHelper)
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix,cgl.mMatrix,[x.get(),y.get(),z.get()]);
            CABLES.GL_MARKER.drawSphere(op,inSize.get());
            cgl.popModelMatrix();
        }
    }

    if(!cgl.getShader())
    {
         next.trigger();
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
        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        inSmooth.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);

        x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);
        updateWorldspace();
    }

    if(!shader)return;
    next.trigger();
};

function updateWorldspace()
{
    if(!shader)return;
    if(inWorldSpace.get()) shader.define(moduleVert.prefix+"WORLDSPACE");
        else shader.removeDefine(moduleVert.prefix+"WORLDSPACE");
}
