const
    render=op.addInPort(new CABLES.Port(op,"Render",CABLES.OP_PORT_TYPE_FUNCTION)),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    inLoop=op.inValueBool("Loop",false),
    inRGB=op.inValueBool("RGB",false),
    minValue=op.inValue("Minimum value",0),
    maxValue=op.inValue("Maximum value",1),
    numX=op.inValue("Num X",10),
    numY=op.inValue("Num Y",10),
    addX=op.inValue("X",0),
    addY=op.inValue("Y",0),
    addZ=op.inValue("Z",0),
    trigger=op.addOutPort(new CABLES.Port(op,"Next",CABLES.OP_PORT_TYPE_FUNCTION));

op.setPortGroup("Look",[inRGB,inLoop,minValue,maxValue]);
op.setPortGroup("Position",[addX,addY,addZ]);
op.setPortGroup("Scaling",[numX,numY]);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const timeUniform=new CGL.Uniform(shader,'f','time',1.0);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const srcFrag=attachments.pixelnoise2_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const uni_numX=new CGL.Uniform(shader,'f','numX',numX);
const uni_numY=new CGL.Uniform(shader,'f','numY',numY);
const uni_addX=new CGL.Uniform(shader,'f','addX',addX);
const uni_addY=new CGL.Uniform(shader,'f','addY',addY);
const uni_addZ=new CGL.Uniform(shader,'f','addZ',addZ);
const uni_minValue=new CGL.Uniform(shader,'f','minIn',minValue);
const uni_maxValue=new CGL.Uniform(shader,'f','maxIn',maxValue);

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

