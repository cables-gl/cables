// http://john-chapman-graphics.blogspot.com/2013/02/pseudo-lens-flare.html

const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const textureFlare=op.inTexture("Input");
const inAmountGhosts=op.inValueSlider("Ghosts",1.0);
const inNumGhosts=op.inValueInt("Num Ghosts",3);
const inDispersal=op.inValueSlider("Dispersal",0.5);
const inAmountHalo=op.inValueSlider("Halo",1.0);
const inHaloWidth=op.inValueSlider("Halo Width",0.5);
const textureLookup=op.inTexture("Color Lookup");
const trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

textureLookup.onChange=function()
{
    if(textureLookup.get())shader.define("TEX_LOOPUP");
        else shader.removeDefine("TEX_LOOPUP");
};

shader.setSource(shader.getDefaultVertexShader(),attachments.lensflares_frag||'');
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureUniformIn=new CGL.Uniform(shader,'t','texInput',1);
var textureLookupUni=new CGL.Uniform(shader,'t','texLookup',2);

const uniHaloWidth=new CGL.Uniform(shader,'f','haloWidth',inHaloWidth);
const uniNumGhosts=new CGL.Uniform(shader,'i','numGhosts',inNumGhosts);
const uniDispersal=new CGL.Uniform(shader,'f','dispersal',inDispersal);
const uniAmountGhosts=new CGL.Uniform(shader,'f','amountGhosts',inAmountGhosts);
const uniAmounthalo=new CGL.Uniform(shader,'f','amountHalo',inAmountHalo);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );

    if(textureFlare.get()) cgl.setTexture(1, textureFlare.get().tex );
    if(textureLookup.get()) cgl.setTexture(2, textureLookup.get().tex );


    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
