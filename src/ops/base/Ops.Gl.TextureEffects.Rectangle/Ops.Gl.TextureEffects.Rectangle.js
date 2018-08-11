var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var inWidth=op.addInPort(new Port(op,"Width",OP_PORT_TYPE_VALUE,{display:'range'}));
var inHeight=op.addInPort(new Port(op,"Height",OP_PORT_TYPE_VALUE,{display:'range'}));
var inPosX=op.addInPort(new Port(op,"X",OP_PORT_TYPE_VALUE,{display:'range'}));
var inPosY=op.addInPort(new Port(op,"Y",OP_PORT_TYPE_VALUE,{display:'range'}));

var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect rectangle');
shader.setSource(shader.getDefaultVertexShader(),attachments.rectangle_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniHeight=new CGL.Uniform(shader,'f','height',0);
var unWidth=new CGL.Uniform(shader,'f','width',0);
var uniX=new CGL.Uniform(shader,'f','x',0);
var uniY=new CGL.Uniform(shader,'f','y',0);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);
inWidth.set(0.25);
inHeight.set(0.25);

var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformA=new CGL.Uniform(shader,'f','a',a);

render.onTriggered=function()
{
    var w=inWidth.get();
    var h=inHeight.get();
    var x=inPosX.get();
    var y=inPosY.get();

    if(w<0)
    {
        x+=w;
        w*=-1;
    }
    if(h<0)
    {
        y+=h;
        h*=-1;
    }

    uniX.set(x);
    uniY.set(y);
    uniHeight.set(h);
    unWidth.set(w);

    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

