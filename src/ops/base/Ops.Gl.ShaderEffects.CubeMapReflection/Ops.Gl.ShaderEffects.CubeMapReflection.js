
var render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var inCubemap=op.inObject("Cubemap");

var inAmount=op.inValueSlider("Amount",0.3);

var next=op.addOutPort(new Port(this,"next",OP_PORT_TYPE_FUNCTION));

var shader=null;
var moduleFrag=null;
var moduleVert=null;

var cgl=op.patch.cgl;

render.onLinkChanged=removeModule;

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
                srcHeadVert:attachments.cm_reflection_head_vert,
                srcBodyVert:attachments.cm_reflection_body_vert
            });

        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:attachments.cm_reflection_head_frag,
                srcBodyFrag:attachments.cm_reflection_body_frag
            },moduleVert);

        inAmount.amount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);
        inCubemap.uni=new CGL.Uniform(shader,'i',moduleFrag.prefix+'cubemap',4);
    }

    cgl.gl.activeTexture(cgl.gl.TEXTURE04);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, inCubemap.get().cubemap);
    
    if(!shader)return;

    next.trigger();
};
