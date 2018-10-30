const render=op.inTrigger("render");
const r=op.inValue('r',1);
const g=op.inValue('g',1);
const b=op.inValue('b',1);
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.rgbmul_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const uniformR=new CGL.Uniform(shader,'f','r',r);
const uniformG=new CGL.Uniform(shader,'f','g',g);
const uniformB=new CGL.Uniform(shader,'f','b',b);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};