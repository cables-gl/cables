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
    .endl()+'varying vec4 meshPixelNoise_pos;'
    .endl();

var srcBodyVert=''
    .endl()+'meshPixelNoise_pos=pos;'
    .endl();

var srcHeadFrag=attachments.pixelnoise_frag
    .endl()+'uniform float {{mod}}_scale;'
    .endl()+'uniform float {{mod}}_amount;'
    .endl();

var srcBodyFrag=''
    .endl()+'   col.rgb-=meshPixelNoise(meshPixelNoise_pos.xyz*{{mod}}_scale)*{{mod}}_amount;'

    .endl();


var moduleFrag=null;
var moduleVert=null;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


// var uniOffsetX=null;
// var uniOffsetY=null;

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
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        // uniOffsetX=new CGL.Uniform(shader,'f',moduleVert.prefix+'_offsetX',offsetX);
        // uniOffsetY=new CGL.Uniform(shader,'f',moduleVert.prefix+'_offsetY',offsetY);


        moduleFrag=shader.addModule(
            {
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            });
        scale=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_scale',inScale);
        amount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_amount',inAmount);

    }
    
    
    if(!shader)return;
    var texSlot=moduleVert.num+5;

    op.trigger.trigger();
};













