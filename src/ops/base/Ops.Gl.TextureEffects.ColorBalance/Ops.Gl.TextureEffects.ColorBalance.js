op.name="ColorBalance";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var tone=op.inValueSelect("Tone",["Highlights","Midtones","Shadows"],"Highlights");

var r=op.inValue("r");
var g=op.inValue("g");
var b=op.inValue("b");

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+''
    .endl()+'float lumi(vec3 color)'
    .endl()+'{'
    .endl()+'   return vec3(dot(vec3(0.2126,0.7152,0.0722), color)).r;'
    .endl()+'}'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec3 base=texture2D(tex,texCoord).rgb;'
    .endl()+'   float l=lumi(base);'

    .endl()+'   #ifdef TONE_MID'
    .endl()+'       l=smoothstep(0.33,0.66,l);'
    .endl()+'   #endif'
    .endl()+'   #ifdef TONE_LOW'
    .endl()+'       l=1.0-l;'
    .endl()+'   #endif'
    .endl()+'   l=l*l;'
    .endl()+'   vec3 color=base+vec3(l*r*0.1,l*g*0.1,l*b*0.1);'
    .endl()+'   gl_FragColor = vec4(color,1.0);'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniR=new CGL.Uniform(shader,'f','r',r);
var uniG=new CGL.Uniform(shader,'f','g',g);
var uniB=new CGL.Uniform(shader,'f','b',b);

tone.onChange=function()
{
    shader.removeDefine("TONE_HIGH");
    shader.removeDefine("TONE_MID");
    shader.removeDefine("TONE_LOW");
    if(tone.get()=="Highlights") shader.define("TONE_HIGH");
    if(tone.get()=="Midtones") shader.define("TONE_MID");
    if(tone.get()=="Shadows") shader.define("TONE_LOW");

    op.log(tone.get());
};


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
