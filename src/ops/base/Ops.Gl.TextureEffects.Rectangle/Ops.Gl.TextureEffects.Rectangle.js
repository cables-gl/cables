op.name="Rectangle";

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

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'

    .endl()+'uniform float width;'
    .endl()+'uniform float height;'
    .endl()+'uniform float x;'
    .endl()+'uniform float y;'

    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 texCol=texture2D(tex,texCoord);'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    
    
    .endl()+'   if(texCoord.x > x && texCoord.x < x+width && 1.0-texCoord.y < y+height && 1.0-texCoord.y > y) col.rgba=vec4(r,g,b,1.0);'
    .endl()+'   gl_FragColor=col;'

    .endl()+'}';


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect rectangle');
shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

op.onLoaded=shader.compile;
var uniHeight=new CGL.Uniform(shader,'f','height',inHeight);
var unWidth=new CGL.Uniform(shader,'f','width',inWidth);
var uniX=new CGL.Uniform(shader,'f','x',inPosX);
var uniY=new CGL.Uniform(shader,'f','y',inPosY);


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
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

