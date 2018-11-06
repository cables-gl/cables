const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const inDepthTex=op.inTexture("Depth Texture");
const farPlane=op.inValue("farplane",50.0);
const nearPlane=op.inValue("nearplane",0.1);
const inInv=op.inValueBool("Invert",false);
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.depthtexture_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','texDepth',0);
const textureBaseUniform=new CGL.Uniform(shader,'t','texBase',1);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);

const uniFarplane=new CGL.Uniform(shader,'f','f',farPlane);
const uniNearplane=new CGL.Uniform(shader,'f','n',nearPlane);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

inInv.onChange=function()
{
    if(inInv.get())shader.define("INVERT");
        else shader.removeDefine("INVERT");
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if(inDepthTex.get() && inDepthTex.get().tex)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, inDepthTex.get().tex );
        cgl.setTexture(1, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};