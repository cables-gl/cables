const render=op.inTrigger("render");
const inTex=op.inTexture("Texture");
const trigger=op.outTrigger("Trigger");

const cgl=op.patch.cgl;
var shader=null;
var mod=null;
var inTexUniform=null;

render.onLinkChanged=removeModule;
render.onTriggered=doRender;

function removeModule()
{
    if(shader && mod)
    {
        shader.removeModule(mod);
        shader=null;
    }
}

function doRender()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        mod=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.bulge_head_vert||'',
                srcBodyVert:attachments.bulge_body_vert||''
            });

        inTexUniform=new CGL.Uniform(shader,'t',mod.prefix+'tex',3);
    }

    if(inTex.get()) cgl.setTexture(3, inTex.get().tex);

    trigger.trigger();
}
