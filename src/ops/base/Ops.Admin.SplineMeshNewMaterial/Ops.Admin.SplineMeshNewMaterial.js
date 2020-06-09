
const
    render=op.inTrigger("Render"),
    inWidth=op.inFloat("Width",0.2),
    trigger=op.outTrigger("Trigger"),
    shaderOut=op.outObject("Shader");

shaderOut.ignoreValueSerialize=true;

const cgl=op.patch.cgl;

op.toWorkPortsNeedToBeLinked(render);

const shader=new CGL.Shader(cgl,"splinemesh_material");
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.splinemat_vert,attachments.splinemat_frag);
shaderOut.set(shader);

shader.addUniformFrag("f","width",inWidth);

render.onTriggered=doRender;

function doRender()
{
    if(!shader)return;

    cgl.pushShader(shader);
    shader.popTextures();

    // if(diffuseTextureUniform && diffuseTexture.get()) shader.pushTexture(diffuseTextureUniform,diffuseTexture.get().tex);
    // if(textureOpacityUniform && textureOpacity.get()) shader.pushTexture(textureOpacityUniform,textureOpacity.get().tex);
    trigger.trigger();

    cgl.popShader();
}
