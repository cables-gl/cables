const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const x=op.inValue("X",0);
const y=op.inValue("Y",0);
const z=op.inValue("Z",0);
const scale=op.inValue("Scale",3);
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);


const srcFrag=(attachments.cellularnoise3d_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);

const uniZ=new CGL.Uniform(shader,'f','z',z);
const uniX=new CGL.Uniform(shader,'f','x',x);
const uniY=new CGL.Uniform(shader,'f','y',y);
const uniScale=new CGL.Uniform(shader,'f','scale',scale);

const tile=op.inValueBool("Tileable",false);
tile.onChange=updateTileable;
function updateTileable()
{
    if(tile.get())shader.define("DO_TILEABLE");
        else shader.removeDefine("DO_TILEABLE");
}

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
