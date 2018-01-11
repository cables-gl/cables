
var render=op.inFunction("render");
var trigger=op.outFunction("Trigger");
var amount=op.inValue("Amount",300);
var height=op.inValue("Height",2);


var uniAmount=null;
var uniHeight=null;
var cgl=op.patch.cgl;
var shader=null;
var mod=null;

function removeModule()
{
    if(shader && mod)
    {
        shader.removeModule(mod);
        shader=null;
    }
}

render.onLinkChanged=removeModule;
render.onTriggered=function()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        mod=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.twist_head_vert,
                srcBodyVert:attachments.twist_vert
            });

        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'amount',amount);
        uniHeight=new CGL.Uniform(shader,'f',mod.prefix+'height',height);
    }

    trigger.trigger();
};
