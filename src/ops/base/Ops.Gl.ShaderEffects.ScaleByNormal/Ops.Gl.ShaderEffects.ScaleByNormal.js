const render=op.inTrigger("render");
const inStrength=op.inValue("Strength",1);
const next=op.outTrigger("trigger");

const cgl=op.patch.cgl;

var shader=null;

const srcHeadVert=attachments.scalebynormal_vert;
const srcBodyVert=''
    .endl()+'pos=MOD_scaler(pos,mat3(modelMatrix)*attrVertNormal);'
    .endl();

var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

render.onLinkChanged=removeModule;

render.onTriggered=function()
{
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

        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
    }

    if(!shader)return;

    next.trigger();
};
