op.name="Vignette";

var render=op.inFunction("render");
var trigger=op.outFunction("trigger");

var amount=op.inValueSlider("Amount",1);
// var lensRadius1=op.inValue("lensRadius1",0.8);
var lensRadius1=op.inValueSlider("Radius",0.5);
var sharp=op.inValueSlider("sharp",0.25);
var aspect=op.inValue("Aspect",1);


var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


shader.setSource(shader.getDefaultVertexShader(),attachments.vignette_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniLensRadius1=new CGL.Uniform(shader,'f','lensRadius1',lensRadius1);
var uniaspect=new CGL.Uniform(shader,'f','aspect',aspect);
var uniAmount=new CGL.Uniform(shader,'f','amount',amount);
var unisharp=new CGL.Uniform(shader,'f','sharp',sharp);

var unir=new CGL.Uniform(shader,'f','r',r);
var unig=new CGL.Uniform(shader,'f','g',g);
var unib=new CGL.Uniform(shader,'f','b',b);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
