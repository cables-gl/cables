op.name="MeshPixelNoise";

var cgl=op.patch.cgl;
var id='mod'+Math.floor(Math.random()*10000);

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inScale=op.inValue("Scale",10);

inAmount=op.inValueSlider("Amount",0.3);

// var offsetX=op.addInPort(new Port(this,"offset X",OP_PORT_TYPE_VALUE));
// var offsetY=op.addInPort(new Port(this,"offset Y",OP_PORT_TYPE_VALUE));


var shader=null;

var srcHeadVert=''
    .endl()+'OUT vec4 MOD_pos;'
    .endl();

var srcBodyVert=''
    .endl()+'MOD_pos=pos;'
    .endl();

var srcHeadFrag=attachments.pixelnoise_frag
    .endl()+'UNI float MOD_scale;'
    .endl()+'UNI float MOD_amount;'
    .endl();

var srcBodyFrag=''
    // .endl()+'   col.rgb=mix(col.rgb,vec3(meshPixelNoise(meshPixelNoise_pos.xyz*MOD_scale)),MOD_amount);'
    .endl()+'   col.rgb-=MOD_meshPixelNoise(MOD_pos.xyz*MOD_scale)*MOD_amount/4.0;'

    .endl();


var moduleFrag=null;
var moduleVert=null;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
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

        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            },moduleVert);

        scale=new CGL.Uniform(shader,'f',moduleFrag.prefix+'scale',inScale);
        amount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);
    }

    if(!shader)return;
    var texSlot=moduleVert.num+5;

    op.trigger.trigger();
};
