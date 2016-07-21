op.name="Circle";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var inSize=op.addInPort(new Port(op,"size",OP_PORT_TYPE_VALUE,{display:'range'}));
var inFadeOut=op.addInPort(new Port(op,"fade Out",OP_PORT_TYPE_VALUE,{display:'range'}));


var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'

    .endl()+'uniform float size;'
    .endl()+'uniform float fadeOut;'

    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    
    .endl()+'   float dist = distance(vec2(0.5,0.5),texCoord);'

    .endl()+'   col.r=r;'
    .endl()+'   col.g=g;'
    .endl()+'   col.b=b;'
    .endl()+'   col.a=0.0;'
    
    .endl()+'   float sz=size*0.5;'
    .endl()+'   float fade=fadeOut+0.02;'
    
    .endl()+'   if(dist<sz)col.a=1.0;'
    .endl()+'   if(dist>sz && dist<sz+fade)col.a=1.0-((dist-sz)/(fade));'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect stripes');
shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

op.onLoaded=shader.compile;
var uniSize=new CGL.Uniform(shader,'f','size',inSize);
var uniFadeOut=new CGL.Uniform(shader,'f','fadeOut',inFadeOut);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);

inSize.set(0.25);

var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformA=new CGL.Uniform(shader,'f','a',a);

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
