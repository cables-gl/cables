const render=op.inTrigger('render');
const multiplierTex = op.inTexture("Multiplier");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const trigger=op.outTrigger('trigger');

const patternWidth=op.inValueSlider("Width",0.1);
const patternHeight=op.inValueSlider("Height",0.1);


const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

op.toWorkPortsNeedToBeLinked(multiplierTex);


shader.setSource(shader.getDefaultVertexShader(),attachments.patternlookup_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const textureMultiplierUniform=new CGL.Uniform(shader,'t','patternTex',1);
const amountUniform =new CGL.Uniform(shader,'f','amount',amount);
const ptrnWidthUniform =new CGL.Uniform(shader,'f','patternWidth',patternWidth);
const patternHeightUniform =new CGL.Uniform(shader,'f','patternHeight',patternHeight);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var multex=multiplierTex.get();
    if(multex)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        if(multex) cgl.setTexture(1, multex.tex );

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }


    trigger.trigger();
};

