const render=op.addInPort(new CABLES.Port(op,"Render",CABLES.OP_PORT_TYPE_FUNCTION));
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const numX=op.inValue("Num X",10);
const numY=op.inValue("Num Y",10);
const addX=op.inValue("X",0);
const addY=op.inValue("Y",0);
const addZ=op.inValue("Z",0);
const inRGB=op.inValueBool("RGB",false);

const trigger=op.addOutPort(new CABLES.Port(op,"Next",CABLES.OP_PORT_TYPE_FUNCTION));

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const timeUniform=new CGL.Uniform(shader,'f','time',1.0);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);

const srcFrag=attachments.pixelnoise_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

numX.uniform==new CGL.Uniform(shader,'f','numX',numX);
numY.uniform==new CGL.Uniform(shader,'f','numY',numY);
addX.uniform==new CGL.Uniform(shader,'f','addX',addX);
addY.uniform==new CGL.Uniform(shader,'f','addY',addY);
addZ.uniform==new CGL.Uniform(shader,'f','addZ',addZ);

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

