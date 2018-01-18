
var cgl=op.patch.cgl;
// var id='mod'+Math.floor(Math.random()*10000);

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inAmount=op.inValueSlider("Amount",0.3);
var shader=null;

var srcHeadVert=''
    .endl()+'UNI float MOD_amount;'

    .endl();

var srcBodyVert=''

    // .endl()+'pos.xyz=pos.xyz*(1.0-MOD_amount)+(vec3(MOD_x,MOD_y,MOD_z)*90.0*MOD_amount);'
    .endl()+'if(texCoord.y>=MOD_amount)pos.xyz*=0.0;'
    
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

        inAmount.amount=new CGL.Uniform(shader,'f',moduleVert.prefix+'amount',inAmount);
    }

    if(!shader)return;

    op.trigger.trigger();
};
