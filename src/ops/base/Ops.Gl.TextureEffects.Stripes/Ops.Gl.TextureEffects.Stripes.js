op.name="Stripes";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var num=op.addInPort(new Port(op,"num",OP_PORT_TYPE_VALUE));
var width=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE,{display:'range'}));
var axis=op.addInPort(new Port(op,"axis",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['X','Y','Diagonal','Diagonal Flip']}));

var offset=op.addInPort(new Port(op,"offset",OP_PORT_TYPE_VALUE));

var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'

    .endl()+'uniform float num;'
    .endl()+'uniform float width;'
    .endl()+'uniform float axis;'
    .endl()+'uniform float offset;'

    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    
    .endl()+'   float v=0.0;'
    .endl()+'   float c=1.0;'
    .endl()+'   if(axis==0.0) v=texCoord.y;'
    .endl()+'   if(axis==1.0) v=texCoord.x;'
    .endl()+'   if(axis==2.0) v=texCoord.x+texCoord.y;'
    .endl()+'   if(axis==3.0) v=texCoord.x-texCoord.y;'
    .endl()+'   v+=offset;'
    

    .endl()+'   float m=mod(v,1.0/num);'
    .endl()+'   float rm=width*2.0*1.0/num/2.0;'
    
    .endl()+'   if(m>rm) col.rgb=mix(col.rgb,vec3( r,g,b ),a);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

axis.onValueChanged=function()
{
    if(axis.get()=='X')uniAxis.setValue(0);
    if(axis.get()=='Y')uniAxis.setValue(1);
    if(axis.get()=='Diagonal')uniAxis.setValue(2);
    if(axis.get()=='Diagonal Flip')uniAxis.setValue(3);
};

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect stripes');
shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

op.onLoaded=shader.compile;
var numUniform=new CGL.Uniform(shader,'f','num',num);
var uniWidth=new CGL.Uniform(shader,'f','width',width);
var uniAxis=new CGL.Uniform(shader,'f','axis',0);
var uniOffset=new CGL.Uniform(shader,'f','offset',offset);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);
axis.set('X');
num.set(5);
width.set(0.5);

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
