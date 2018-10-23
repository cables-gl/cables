op.name="Mirror";

var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

var axis=op.addInPort(new Port(op,"axis",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['X','Y']}));
var width=op.addInPort(new Port(op,"width",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var offset=op.addInPort(new Port(op,"offset",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var flip=op.addInPort(new Port(op,"flip",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

width.set(0.5);


shader.setSource(shader.getDefaultVertexShader(),attachments.mirror_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniAxis=new CGL.Uniform(shader,'f','axis',0);
var uniWidth=new CGL.Uniform(shader,'f','width',width);
var uniOffset=new CGL.Uniform(shader,'f','offset',offset);
var uniFlip=new CGL.Uniform(shader,'f','flip',0);

flip.onValueChanged=function()
{
    if(flip.get())uniFlip.setValue(1);
    else uniFlip.setValue(0);
};

axis.onValueChanged=function()
{
    if(axis.get()=='X')uniAxis.setValue(0);
    if(axis.get()=='Y')uniAxis.setValue(1);
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
