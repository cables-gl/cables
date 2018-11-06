const render=op.inTrigger("render");
const amountX=op.inValue("Cell size x",0.5);
const amountY=op.inValue("Cell size y",0.5);
const offsetX=op.inValue("Offset x",0);
const offsetY=op.inValue("offset y",0);
const rotate=op.inValue("rotate",0);
const inTime=op.inValue("time",2);
const trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.repeat_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountXUniform=new CGL.Uniform(shader,'f','amountX',amountX);
const amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);
const offsetXUniform=new CGL.Uniform(shader,'f','offsetX',offsetX);
const offsetYUniform=new CGL.Uniform(shader,'f','offsetY',offsetY);
const rotateUniform=new CGL.Uniform(shader,'f','rotate',rotate);

const inTimeUniform=new CGL.Uniform(shader,'f','time',inTime);

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

