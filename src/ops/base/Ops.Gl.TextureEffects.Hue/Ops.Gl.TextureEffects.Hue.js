const
    render=op.inTrigger('render'),
    hue=op.inValueSlider("hue",1),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.hue_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const uniformHue=new CGL.Uniform(shader,'f','hue',1.0);

hue.onChange=function(){ uniformHue.setValue(hue.get()); };

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
