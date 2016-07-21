op.name="Circle";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var inSize=op.addInPort(new Port(op,"size",OP_PORT_TYPE_VALUE,{display:'range'}));
var inFadeOut=op.addInPort(new Port(op,"fade Out",OP_PORT_TYPE_VALUE,{display:'range'}));

var warnOverflow=op.addInPort(new Port(op,"warn overflow",OP_PORT_TYPE_VALUE,{display:'bool'}));
var fallOff=op.addInPort(new Port(op,"fallOff",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['Linear','SmoothStep']}));

warnOverflow.set(true);

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
    .endl()+'   vec4 texCol=texture2D(tex,texCoord);'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   float dist = distance(vec2(0.5,0.5),texCoord);'

    .endl()+'   float sz=size*0.5;'
    .endl()+'   float fade=fadeOut+0.002;'
    .endl()+'   col.a=0.0;'

    .endl()+'   if(dist<sz) col.a=1.0;'

    .endl()+'   #ifdef FALLOFF_SMOOTHSTEP'
    .endl()+'       if(dist>sz && dist<sz+fade)col.a=1.0-(smoothstep(0.0,1.0,(dist-sz)/(fade)) );'
    .endl()+'   #endif'
    .endl()+'   #ifndef FALLOFF_SMOOTHSTEP'
    .endl()+'       if(dist>sz && dist<sz+fade)col.a=1.0-((dist-sz)/(fade));'
    .endl()+'   #endif'
    
    .endl()+'   col.a*=a;'
    
    .endl()+'   gl_FragColor.rgb = mix(texCol.rgb,vec3(r,g,b),col.a);'
    .endl()+'   gl_FragColor.a=col.a;'

    .endl()+'   #ifdef WARN_OVERFLOW'
    .endl()+'       float width=0.01;'
    .endl()+'       if( texCoord.x>1.0-width || texCoord.y>1.0-width || texCoord.y<width || texCoord.x<width )'
    .endl()+'           if(col.a>0.0)gl_FragColor = vec4(1.0,0.0,0.0, 1.0);'
    .endl()+'   #endif'

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

function setFallOf()
{
    shader.removeDefine('FALLOFF_LINEAR');
    shader.removeDefine('FALLOFF_SMOOTHSTEP');
    
    if(fallOff.get()=='Linear') shader.define('FALLOFF_LINEAR');
    if(fallOff.get()=='SmoothStep') shader.define('FALLOFF_SMOOTHSTEP');
    shader.compile();
}

fallOff.onValueChanged=setFallOf;

function setWarnOverflow()
{
    if(warnOverflow.get()) shader.define('WARN_OVERFLOW');
        else shader.removeDefine('WARN_OVERFLOW');
    shader.compile();

}

warnOverflow.onValueChanged=setWarnOverflow;


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

setFallOf();
setWarnOverflow();