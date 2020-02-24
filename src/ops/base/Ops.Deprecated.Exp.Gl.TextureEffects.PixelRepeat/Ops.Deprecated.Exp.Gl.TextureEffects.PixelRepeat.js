op.name="PixelRepeat";

var render=op.inTrigger('render');

var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.pixelrepeat_frag);

var uniMask=new CGL.Uniform(shader,'t','mask',1);
var unTex=new CGL.Uniform(shader,'t','tex',0);



var time=op.inValue("Time");
var uniTime=new CGL.Uniform(shader,'f','time',time);

var mask=op.addInPort(new CABLES.Port(op,"mask",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true }));


var prim=op.inValueSelect("Primitive",["Rectangle","Circle"],"Rectangle");


render.onTriggered=function()
{
    if(!mask.get())return;
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    

    cgl.setTexture(1,mask.get().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
