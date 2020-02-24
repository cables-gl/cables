const render=op.inTrigger("Render");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const scale=op.inValue("scale",10);
const angle=op.inValue("angle");
const add=op.inValue("Add");
const trigger=op.outTrigger("Next");
const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.trianglenoise_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const addUniform=new CGL.Uniform(shader,'f','add',add);
const scaleUniform=new CGL.Uniform(shader,'f','scale',scale);
const angleUniform=new CGL.Uniform(shader,'f','angle',angle);
const ratioUniform=new CGL.Uniform(shader,'f','ratio',0.57);

var oldRatio=-1;

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var ratio=cgl.currentTextureEffect.getCurrentSourceTexture().width/cgl.currentTextureEffect.getCurrentSourceTexture().height;
    if(ratio!=oldRatio)
    {
        ratioUniform.setValue(ratio);
        oldRatio=ratio;
    }

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

