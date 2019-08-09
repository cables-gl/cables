const
    render=op.inTrigger('render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    depthTex=op.inTexture("depth texture"),
    fogColorTex=op.inTexture("Color gradient"),
    nearPlaneIn = op.inFloat("Frustum near",0.01),
    farPlaneIn = op.inFloat("Frustum far",25.0),
    fogStart=op.inFloatSlider("fogStart",0),
    fogEnd=op.inFloatSlider("fogEnd",1.0),
    density=op.inFloatSlider("density",0.5),
    trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var srcFrag=attachments.fog_frag;

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
const textureUniform=new CGL.Uniform(shader,'t','image',0);
const textureUniform2=new CGL.Uniform(shader,'t','depthTex',1);
const textureUniform3=new CGL.Uniform(shader,'t','fogColorTex',2);

const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
farPlaneIn.uniform=new CGL.Uniform(shader,'f','farPlaneIn',farPlaneIn);
nearPlaneIn.uniform=new CGL.Uniform(shader,'f','nearPlaneIn',nearPlaneIn);
fogEnd.uniform=new CGL.Uniform(shader,'f','fogEnd',fogEnd);
fogStart.uniform=new CGL.Uniform(shader,'f','fogStart',fogStart);
density.uniform=new CGL.Uniform(shader,'f','density',density);

{
    // fog color
    var r=op.addInPort(new CABLES.Port(op,"fog r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    var g=op.addInPort(new CABLES.Port(op,"fog g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    var b=op.addInPort(new CABLES.Port(op,"fog b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    var a=op.addInPort(new CABLES.Port(op,"fog a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

    const uniR=new CGL.Uniform(shader,'f','r',r);
    const uniG=new CGL.Uniform(shader,'f','g',g);
    const uniB=new CGL.Uniform(shader,'f','b',b);
    const uniA=new CGL.Uniform(shader,'f','a',a);

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}

var invert=op.inBool("invert direction",false);
const uniInvert=new CGL.Uniform(shader,'b','invert',invert);

fogColorTex.onChange=function()
{
    if(fogColorTex.get() && fogColorTex.get().tex) shader.define('HAS_GRADIENT');
        else shader.removeDefine('HAS_GRADIENT');
};

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        if(depthTex.get()) cgl.setTexture(1, depthTex.get().tex );
        if(fogColorTex.get()) cgl.setTexture(2, fogColorTex.get().tex );


        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();

        trigger.trigger();
};