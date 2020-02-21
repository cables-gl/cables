const
    render=op.inTrigger("Render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    inLoop=op.inValueBool("Loop",false),
    inRGB=op.inValueBool("RGB",false),
    minValue=op.inValue("Minimum value",0),
    maxValue=op.inValue("Maximum value",1),
    scale=op.inValue("Scale",2),
    orientation=op.inBool("Orientation",false),
    addX=op.inValue("X",0),
    addY=op.inValue("Y",0),
    addZ=op.inValue("Z",0),
    seed2=op.inValue("Seed",0),
    trigger=op.outTrigger("Next");

op.setPortGroup("Look",[inRGB,inLoop,minValue,maxValue]);
op.setPortGroup("Position",[addX,addY,addZ]);
op.setPortGroup("Position",[addX,addY,addZ]);
op.setPortGroup("",[scale]);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.hexnoise_frag);

const
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    timeUniform=new CGL.Uniform(shader,'f','time',1.0),
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    uni_scale=new CGL.Uniform(shader,'f','scale',scale),
    uni_addX=new CGL.Uniform(shader,'f','addX',addX),
    uni_addY=new CGL.Uniform(shader,'f','addY',addY),
    uni_addZ=new CGL.Uniform(shader,'f','addZ',addZ),
    uni_seed=new CGL.Uniform(shader,'f','seed2',seed2),
    uni_minValue=new CGL.Uniform(shader,'f','minIn',minValue),
    uni_maxValue=new CGL.Uniform(shader,'f','maxIn',maxValue);

inLoop.onChange=function()
{
    if(inLoop.get())shader.define("LOOP");
      else shader.removeDefine("LOOP");
};
inRGB.onChange=function()
{
    if(inRGB.get())shader.define("RGB");
      else shader.removeDefine("RGB");
};
orientation.onChange=function()
{
    if(orientation.get())shader.define("FLIP");
      else shader.removeDefine("FLIP");
};

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

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

