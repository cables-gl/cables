
var render=op.inTrigger('render');
var hue=op.addInPort(new CABLES.Port(op,"hue",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var trigger=op.outTrigger('trigger');

hue.set(1.0);
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.hue_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniformHue=new CGL.Uniform(shader,'f','hue',1.0);

hue.onChange=function(){ uniformHue.setValue(hue.get()); };

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
