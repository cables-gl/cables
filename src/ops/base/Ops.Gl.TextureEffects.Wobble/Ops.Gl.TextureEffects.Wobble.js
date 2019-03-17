const
    render=op.inTrigger("Render"),
    time=op.inValue("time",0),
    speedX=op.inValue("SpeedX",4),
    speedY=op.inValue("SpeedY",8),

    repeatX=op.inValue("RepeatX",11),
    repeatY=op.inValue("RepeatY",11),
    mul=op.inValue("Multiply",0.01),

    trigger=op.outTrigger("Trigger");



const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.wobble_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const timeUniform=new CGL.Uniform(shader,'f','time',time);
const speedXUniform=new CGL.Uniform(shader,'f','speedX',speedX);
const speedYUniform=new CGL.Uniform(shader,'f','speedY',speedY);
const repeatXUniform=new CGL.Uniform(shader,'f','repeatX',repeatX);
const repeatYUniform=new CGL.Uniform(shader,'f','repeatY',repeatY);
const mulUniform=new CGL.Uniform(shader,'f','mul',mul);

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
