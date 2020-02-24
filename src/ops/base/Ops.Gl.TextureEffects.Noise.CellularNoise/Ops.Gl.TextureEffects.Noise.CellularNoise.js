const
    render=op.inTrigger('render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    x=op.inValue("X",0),
    y=op.inValue("Y",0),
    z=op.inValue("Z",0),
    scale=op.inValue("Scale",3),
    trigger=op.outTrigger('trigger'),
    tile=op.inValueBool("Tileable",false);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);


shader.setSource(shader.getDefaultVertexShader(),attachments.cellularnoise3d_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    uniZ=new CGL.Uniform(shader,'f','z',z),
    uniX=new CGL.Uniform(shader,'f','x',x),
    uniY=new CGL.Uniform(shader,'f','y',y),
    uniScale=new CGL.Uniform(shader,'f','scale',scale);

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

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
