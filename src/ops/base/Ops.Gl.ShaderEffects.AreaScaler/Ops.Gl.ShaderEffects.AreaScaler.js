
op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inSize=op.inValue("Size",1);
var inStrength=op.inValue("Strength",1);
var inSmooth=op.inValueBool("Smooth",true);
var inToZero=op.inValueBool("Keep Min Size",true);

const cgl=op.patch.cgl;

var x=op.inValue("x");
var y=op.inValue("y");
var z=op.inValue("z");

var needsUpdateToZero=true;


var shader=null;

var srcHeadVert=attachments.areascale_vert;

var srcBodyVert=''
    .endl()+'pos=MOD_scaler(pos,mMatrix*pos,attrVertNormal);' //modelMatrix*
    .endl();
    
var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

inToZero.onChange=updateToZero;

function updateToZero()
{
    if(!shader)
    {
        needsUpdateToZero=true;
        return;
    }
    if(inToZero.get()) shader.removeDefine(moduleVert.prefix+"TO_ZERO");
        else shader.define(moduleVert.prefix+"TO_ZERO");
        
    needsUpdateToZero=false;

}




op.render.onLinkChanged=removeModule;

op.render.onTriggered=function()
{
    if(!cgl.getShader())
    {
         op.trigger.trigger();
         return;
    }
    
    if(CABLES.UI && gui.patch().isCurrentOp(op)) 
        gui.setTransformGizmo(
            {
                posX:x,
                posY:y,
                posZ:z
            });


    if(CABLES.UI && CABLES.UI.renderHelper)
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,[x.get(),y.get(),z.get()]);
        CABLES.GL_MARKER.drawSphere(op,inSize.get());
        cgl.popModelMatrix();
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
    }
    

    if(needsUpdateToZero)updateToZero();

    if(!shader)return;

    op.trigger.trigger();
};
