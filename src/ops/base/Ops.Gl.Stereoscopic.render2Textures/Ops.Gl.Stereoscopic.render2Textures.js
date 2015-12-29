
CABLES.Op.apply(this, arguments);
this.name='stereoscopic';

var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

var eyeDist=this.addInPort(new Port(this,"eyeDist"));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var tex0=this.addOutPort(new Port(this,"texture left",OP_PORT_TYPE_TEXTURE,{preview:true}));
var tex1=this.addOutPort(new Port(this,"texture right",OP_PORT_TYPE_TEXTURE,{preview:true}));


// if(doTranslate)mat4.translate(transMatrix,transMatrix, vPos);
var w=1024;
var h=1025;

var fb=[new CGL.Framebuffer(cgl,w,h),new CGL.Framebuffer(cgl,w,h)];
tex0.set( fb[0].getTextureColor() );
tex1.set( fb[1].getTextureColor() );


render.onTriggered=function()
{

cgl.gl.disable(cgl.gl.SCISSOR_TEST);

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

cgl.gl.enable(cgl.gl.SCISSOR_TEST);


}