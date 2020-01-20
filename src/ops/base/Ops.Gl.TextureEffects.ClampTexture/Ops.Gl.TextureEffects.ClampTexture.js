const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const modeSelect = op.inValueSelect("Mode",["Clamp","Remap","Remap smooth"],"Clamp");
const amount=op.inValueSlider("Amount",1);
const inLowEdge=op.inValue("Min",0.0);
const inHighEdge=op.inValue("Max",1.0);

const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.clampShader_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const lowEdgeUniform=new CGL.Uniform(shader,'f','lowEdge',inLowEdge);
const highEdgeUniform=new CGL.Uniform(shader,'f','highEdge',inHighEdge);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

op.init = modeSelect.onChange = function()
{
    shader.toggleDefine('CLAMP',modeSelect.get() === "Clamp");
    shader.toggleDefine('REMAP',modeSelect.get() === "Remap");
    shader.toggleDefine('REMAP_SMOOTH',modeSelect.get() === "Remap smooth");
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
