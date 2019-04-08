const
    render=op.inTrigger("render"),
    next=op.outTrigger("trigger"),
    inScale=op.inValue("Scale",10),
    inAmount=op.inValueSlider("Amount",0.3),
    inWorldSpace=op.inValueBool("WorldSpace");


const cgl=op.patch.cgl;
var shader=null;
var moduleFrag=null;
var moduleVert=null;
inWorldSpace.onChange=updateWorldspace;
render.onLinkChanged=removeModule;


var srcHeadVert=''
    .endl()+'OUT vec4 MOD_pos;'
    .endl();

var srcBodyVert=''
    .endl()+'#ifndef WORLDSPACE'
    .endl()+'   MOD_pos=pos;'
    .endl()+'#endif'
    .endl()+'#ifdef WORLDSPACE'
    .endl()+'   MOD_pos=pos*mMatrix;'
    .endl()+'#endif'
    .endl();

var srcHeadFrag=attachments.pixelnoise_frag
    .endl()+'UNI float MOD_scale;'
    .endl()+'UNI float MOD_amount;'
    .endl()+'UNI float MOD_r,MOD_g,MOD_b;'

    .endl();

var srcBodyFrag=''
    .endl()+'col.rgb -= MOD_meshPixelNoise(MOD_pos.xyz*MOD_scale)*MOD_amount/4.0;'
    .endl();

function updateWorldspace()
{
    if(!shader)return;
    if(inWorldSpace.get()) shader.define("WORLDSPACE");
        else shader.removeDefine("WORLDSPACE");
}

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


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

        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            },moduleVert);

        inScale.scale=new CGL.Uniform(shader,'f',moduleFrag.prefix+'scale',inScale);
        inAmount.amount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);
        updateWorldspace();
    }

    if(!shader)return;

    next.trigger();
};
