
var cgl=op.patch.cgl;

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inStrength=op.inValue("Strength",1);
var inModulo=op.inValue("Modulo",1);




var shader=null;

var srcHeadVert=attachments.scalebynormal_vert;

var srcBodyVert=''
    .endl()+'pos=MOD_scaler(pos,attrVertIndex,attrVertNormal);' //modelMatrix*
    .endl();
    
var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


op.render.onLinkChanged=removeModule;

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

        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        inModulo.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'mod',inModulo);

    }
    
    
    if(!shader)return;

    op.trigger.trigger();
};
