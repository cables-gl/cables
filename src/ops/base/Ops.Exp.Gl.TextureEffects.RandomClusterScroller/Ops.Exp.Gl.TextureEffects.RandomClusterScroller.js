op.name="RandomClusterScroller";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.scroller_frag);

var time=op.inValue("Time");
var uniTime=new CGL.Uniform(shader,'f','time',time);

var num=op.inValue("num",20);
var uninum=new CGL.Uniform(shader,'f','num',num);

var blur=op.inValueSlider("blur",0.0);
var uniBlur=new CGL.Uniform(shader,'f','blur',blur);


var minSize=op.inValueSlider("Min Size",0.1);
minSize.uniform=new CGL.Uniform(shader,'f','minSize',minSize);

var maxSize=op.inValueSlider("Max Size",0.2);
maxSize.uniform=new CGL.Uniform(shader,'f','maxSize',maxSize);

var opacity=op.inValueSlider("Opacity",1);
opacity.uniform=new CGL.Uniform(shader,'f','opacity',opacity);


var prim=op.inValueSelect("Primitive",["Rectangle","Circle"],"Rectangle");

prim.onChange=function()
{
    shader.removeDefine("PRIM_RECT");
    shader.removeDefine("PRIM_CIRCLE");
    
    if(prim.get()=="Circle")shader.define("PRIM_CIRCLE");
    if(prim.get()=="Rectangle")shader.define("PRIM_RECT");
}

shader.define("PRIM_RECT");
render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    // cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
