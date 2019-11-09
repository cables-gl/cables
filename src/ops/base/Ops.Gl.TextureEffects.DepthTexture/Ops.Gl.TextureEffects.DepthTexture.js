const
    render=op.inTrigger('render'),
    inDepthTex=op.inTexture("image"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    farPlane=op.inValue("farplane",50.0),
    nearPlane=op.inValue("nearplane",0.1),
    inInv=op.inValueBool("Invert",false),
    trigger=op.outTrigger('trigger');

op.setPortGroup("Frustum",[farPlane,nearPlane]);


const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.depthtexture_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','texDepth',0),
    textureBaseUniform=new CGL.Uniform(shader,'t','texBase',1),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    uniFarplane=new CGL.Uniform(shader,'f','f',farPlane),
    uniNearplane=new CGL.Uniform(shader,'f','n',nearPlane);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

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