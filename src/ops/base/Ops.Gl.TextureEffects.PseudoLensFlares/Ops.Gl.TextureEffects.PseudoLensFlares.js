// http://john-chapman-graphics.blogspot.com/2013/02/pseudo-lens-flare.html

const render=op.inTrigger("render"),
    inAmountGhosts=op.inValueSlider("Ghosts",1.0),
    inNumGhosts=op.inValueInt("Num Ghosts",3),
    inDispersal=op.inValueSlider("Dispersal",0.5),
    inAmountHalo=op.inValueSlider("Halo",1.0),
    inHaloWidth=op.inValueSlider("Halo Width",0.5),
    textureLookup=op.inTexture("Color Lookup"),
    trigger=op.outTrigger("trigger");

const
    cgl=op.patch.cgl,
    shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.lensflares_frag||'');

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    textureLookupUni=new CGL.Uniform(shader,'t','texLookup',1),
    uniHaloWidth=new CGL.Uniform(shader,'f','haloWidth',inHaloWidth),
    uniNumGhosts=new CGL.Uniform(shader,'i','numGhosts',inNumGhosts),
    uniDispersal=new CGL.Uniform(shader,'f','dispersal',inDispersal),
    uniAmountGhosts=new CGL.Uniform(shader,'f','amountGhosts',inAmountGhosts),
    uniAmounthalo=new CGL.Uniform(shader,'f','amountHalo',inAmountHalo);

textureLookup.onChange=function()
{
    if(textureLookup.get())shader.define("TEX_LOOPUP");
        else shader.removeDefine("TEX_LOOPUP");
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );
    if(textureLookup.get()) cgl.setTexture(1, textureLookup.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
