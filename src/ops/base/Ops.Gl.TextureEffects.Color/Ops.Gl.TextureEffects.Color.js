op.name='Color';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(r,g,b,a);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniformR=new CGL.Uniform(shader,'f','r',1.0);
var uniformG=new CGL.Uniform(shader,'f','g',1.0);
var uniformB=new CGL.Uniform(shader,'f','b',1.0);
var uniformA=new CGL.Uniform(shader,'f','a',1.0);


r.onValueChanged=function(){uniformR.setValue(r.get());};
g.onValueChanged=function(){uniformG.setValue(g.get());};
b.onValueChanged=function(){uniformB.setValue(b.get());};
a.onValueChanged=function(){uniformA.setValue(a.get());};
r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};