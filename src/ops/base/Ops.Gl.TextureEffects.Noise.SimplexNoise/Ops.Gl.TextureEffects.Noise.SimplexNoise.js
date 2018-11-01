const render=op.inTrigger('render');
const smoothness=op.addInPort(new CABLES.Port(op,"smoothness",CABLES.OP_PORT_TYPE_VALUE,{  }));
const scale=op.addInPort(new CABLES.Port(op,"scale",CABLES.OP_PORT_TYPE_VALUE,{  }));
const trigger=op.outTrigger('trigger');

const x=op.addInPort(new CABLES.Port(op,"x",CABLES.OP_PORT_TYPE_VALUE,{  }));
const y=op.addInPort(new CABLES.Port(op,"y",CABLES.OP_PORT_TYPE_VALUE,{  }));
const time=op.addInPort(new CABLES.Port(op,"time",CABLES.OP_PORT_TYPE_VALUE,{  }));

const cgl=op.patch.cgl;

time.set(0.314);
smoothness.set(1.0);
scale.set(1.0);
x.set(0);
y.set(0);

var shader=new CGL.Shader(cgl);

var srcFrag=attachments.simplexnoise_frag;

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniSmoothness=new CGL.Uniform(shader,'f','smoothness',smoothness.get());
var uniScale=new CGL.Uniform(shader,'f','scale',scale.get());
var uniX=new CGL.Uniform(shader,'f','x',x.get());
var uniY=new CGL.Uniform(shader,'f','y',y.get());
var uniTime=new CGL.Uniform(shader,'f','time',time.get());

x.onChange=function() { uniX.setValue(x.get()/100); };
y.onChange=function(){ uniY.setValue(y.get()/100); };
time.onChange=function(){ uniTime.setValue(time.get()/100); };

smoothness.onChange=function(){ uniSmoothness.setValue(smoothness.get());};
scale.onChange=function(){ uniScale.setValue(scale.get()); };

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );


    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
