var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var amountX=op.inValue("amountX");
var amountY=op.inValue("amountY");

var repeat=op.inValueBool("Repeat",true);

repeat.onChange=updateRepeat;

var cgl=op.patch.cgl;


var shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.scroll_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountXUniform=new CGL.Uniform(shader,'f','amountX',amountX);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

updateRepeat();

function updateRepeat()
{
    if(!repeat.get())shader.define("NO_REPEAT");
    else shader.removeDefine("NO_REPEAT");
}

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
