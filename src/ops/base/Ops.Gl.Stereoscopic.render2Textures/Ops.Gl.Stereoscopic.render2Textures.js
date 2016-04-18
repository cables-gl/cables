op.name='stereoscopic';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var eyeDist=op.addInPort(new Port(op,"eyeDist"));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var tex0=op.addOutPort(new Port(op,"texture left",OP_PORT_TYPE_TEXTURE,{preview:true}));
var tex1=op.addOutPort(new Port(op,"texture right",OP_PORT_TYPE_TEXTURE,{preview:true}));


var cgl=op.patch.cgl;
var w=1024;
var h=1025;

var fb=[new CGL.Framebuffer(cgl,w,h),new CGL.Framebuffer(cgl,w,h)];
tex0.set( fb[0].getTextureColor() );
tex1.set( fb[1].getTextureColor() );


render.onTriggered=function()
{
    fb[0].renderStart();
    cgl.pushMvMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, [-eyeDist.get()*0.5,0,0,1]);
    trigger.trigger();
    cgl.popMvMatrix();
    fb[0].renderEnd();

    cgl.resetViewPort();

    fb[1].renderStart();
    cgl.pushMvMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, [eyeDist.get()*0.5,0,0,1]);
    trigger.trigger();
    cgl.popMvMatrix();
    fb[1].renderEnd();

    cgl.resetViewPort();
}