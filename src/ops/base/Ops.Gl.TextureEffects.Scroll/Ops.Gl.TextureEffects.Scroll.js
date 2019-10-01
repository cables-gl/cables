const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    amountX=op.inValue("amountX"),
    amountY=op.inValue("amountY"),
    textureMask=op.inTexture("Mask"),
    repeat=op.inValueBool("Repeat",true);

repeat.onChange=updateRepeat;

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.scroll_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountXUniform=new CGL.Uniform(shader,'f','amountX',amountX),
    amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY),
    unitexMask=new CGL.Uniform(shader,'t','texMask',1);

updateRepeat();

textureMask.onChange=function()
{
    if(textureMask.get())shader.define("MASK");
    else shader.removeDefine("MASK");
};

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
    if(textureMask.get()) cgl.setTexture(1, textureMask.get().tex );


    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
