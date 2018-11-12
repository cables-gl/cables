const render=op.inTrigger("Render");
const inWidth=op.inValue("Width",0.5);
const next=op.outTrigger("Next");

const cgl=op.patch.cgl;

var shader=null;
var moduleFrag=null;
var moduleVert=null;

render.onLinkChanged=removeModule;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

render.onTriggered=function()
{
    if(!cgl.getShader()) return;

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.shaderEffectExample_head_vert||'',
                srcBodyVert:attachments.shaderEffectExample_body_vert||''
            });

        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:attachments.shaderEffectExample_head_frag||'',
                srcBodyFrag:attachments.shaderEffectExample_body_frag||''
            },moduleVert);
            
        inWidth.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'width',inWidth);


    }

    if(!shader)return;

    next.trigger();
};

