var render=op.inTrigger('render');
var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var x=op.inValue("Width",20);
var y=op.inValue("Height",20);
var mul=op.inValue("Mul",1);
var time=op.inValue("Time",1);
var trigger=op.outTrigger('trigger');

var greyscale=op.inValueBool("Greyscale",true);

greyscale.onChange=function()
{
    if(greyscale.get())shader.define('GREY');
        else shader.removeDefine('GREY');

};

var srcFrag=''
    .endl()+'#define PI 3.1415926535897932384626433832795'
     
    .endl()+'uniform float time;'
    .endl()+'uniform float w;'
    .endl()+'uniform float h;'
    .endl()+'uniform float mul;'
    .endl()+'uniform float amount;'
    .endl()+'uniform sampler2D tex;'

    .endl()+'IN vec2 texCoord;'

    +CGL.TextureEffect.getBlendCode()

    .endl()+'void main() {'
    .endl()+'   vec2 size=vec2(w,h);'
    .endl()+'    float v = 0.0;'
    .endl()+'    vec2 c = texCoord * size - size/2.0;'
    .endl()+'    v += sin((c.x+time));'
    .endl()+'    v += sin((c.y+time)/2.0);'
    .endl()+'    v += sin((c.x+c.y+time)/2.0);'
    .endl()+'    c += size/2.0 * vec2(sin(time/3.0), cos(time/2.0));'
    .endl()+'    v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+time);'
    .endl()+'    v = v/2.0;'
    .endl()+'    vec3 newColor = vec3(sin(PI*v*mul/4.0), sin(PI*v*mul), cos(PI*v*mul))*.5 + .5;'

    .endl()+'   vec4 base=texture2D(tex,texCoord);'
    
    .endl()+'   #ifndef GREY'
    .endl()+'       vec4 col=vec4( _blend(base.rgb,newColor) ,1.0);'
    .endl()+'   #endif'
    .endl()+'   #ifdef GREY'
    // .endl()+'       vec4 col=vec4( _blend(base.rgb,vec3((newColor.r+newColor.g+newColor.b)/3.0)) ,1.0);'
        .endl()+'       vec4 col=vec4( _blend(base.rgb,vec3(newColor.g)) ,1.0);'
    .endl()+'   #endif'
    
    .endl()+'   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);'

    .endl()+'    outColor= col;'
    .endl()+'}';

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
shader.define('GREY');
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniX=new CGL.Uniform(shader,'f','w',x);
var uniY=new CGL.Uniform(shader,'f','h',y);
var uniTime=new CGL.Uniform(shader,'f','time',time);
var uniMul=new CGL.Uniform(shader,'f','mul',mul);

var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);


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

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};
