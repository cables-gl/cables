var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var tone=op.inValueSelect("Tone",["Highlights","Midtones","Shadows"],"Highlights");
var r=op.inValue("r");
var g=op.inValue("g");
var b=op.inValue("b");

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;


shader.setSource(shader.getDefaultVertexShader(),attachments.colorbalance_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniR=new CGL.Uniform(shader,'f','r',r);
var uniG=new CGL.Uniform(shader,'f','g',g);
var uniB=new CGL.Uniform(shader,'f','b',b);

tone.onChange=function()
{
    shader.removeDefine("TONE_HIGH");
    shader.removeDefine("TONE_MID");
    shader.removeDefine("TONE_LOW");
    if(tone.get()=="Highlights") shader.define("TONE_HIGH");
    if(tone.get()=="Midtones") shader.define("TONE_MID");
    if(tone.get()=="Shadows") shader.define("TONE_LOW");
};


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
