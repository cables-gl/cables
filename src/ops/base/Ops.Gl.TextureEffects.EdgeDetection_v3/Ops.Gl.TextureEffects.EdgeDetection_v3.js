const
    render=op.inTrigger("Render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    strength=op.inFloat("Strength",4.0),
    width=op.inValueSlider("Width",0.1),
    mulColor=op.inValueSlider("Mul Color",0),
    // offsetPixel=op.inBool("Offset Pixel",false),
    trigger=op.outTrigger("Trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);
// offsetPixel.onChange=updateOffsetPixel;

shader.setSource(shader.getDefaultVertexShader(),attachments.edgedetect_frag);

// updateOffsetPixel();

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    strengthUniform=new CGL.Uniform(shader,'f','strength',strength),
    widthUniform=new CGL.Uniform(shader,'f','width',width),
    uniWidth=new CGL.Uniform(shader,'f','texWidth',128),
    uniHeight=new CGL.Uniform(shader,'f','texHeight',128),
    uniMulColor=new CGL.Uniform(shader,'f','mulColor',mulColor);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

// function updateOffsetPixel()
// {
//     shader.toggleDefine('OFFSETPIXEL',offsetPixel.get());
// }

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};