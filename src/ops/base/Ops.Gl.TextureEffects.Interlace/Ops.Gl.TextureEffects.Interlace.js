op.name="Interlace";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amount=op.inValueSlider("amount",0.5);//op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE,{display:'range'}));
var lum=op.inValueSlider("Lumi Scale",0.9);
var lineSize=op.inValue("Line Size",4);
var displace=op.inValueSlider("Displacement",0);

var add=op.inValue("Add",0.02);
var inScroll=op.inValue("scroll",0);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;



shader.setSource(shader.getDefaultVertexShader(),attachments.interlace_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniAmount=new CGL.Uniform(shader,'f','amount',amount);

var uniLum=new CGL.Uniform(shader,'f','lum',lum);
var uniLineSize=new CGL.Uniform(shader,'f','lineSize',lineSize);
var uniAdd=new CGL.Uniform(shader,'f','add',add);
var uniDisplace=new CGL.Uniform(shader,'f','displace',displace);
var uniScroll=new CGL.Uniform(shader,'f','scroll',inScroll);


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
