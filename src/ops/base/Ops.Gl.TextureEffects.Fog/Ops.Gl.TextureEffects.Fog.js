

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var density=op.addInPort(new Port(op,"density",OP_PORT_TYPE_VALUE));
var image=op.inTexture("depth texture");
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var ignoreInf=op.addInPort(new Port(op,"ignore infinity",OP_PORT_TYPE_VALUE,{ display:'bool' }));
ignoreInf.set(false);
ignoreInf.onValueChanged=function()
{
    if(ignoreInf.get()) shader.define('FOG_IGNORE_INFINITY');
        else shader.removeDefine('FOG_IGNORE_INFINITY');
};

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D depthTex;'
    .endl()+'  uniform sampler2D image;'
    .endl()+'#endif'
    // .endl()+'uniform float n;'
    // .endl()+'uniform float f;'
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'
    .endl()+'uniform float start;'

    .endl()+'uniform float density;'
    .endl()+'const float LOG2 = 1.442695;'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   vec4 colImg=texture2D(image,texCoord);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(depthTex,texCoord);'
    
    .endl()+'       float z=1.0-col.r;'
    
    .endl()+'       z=smoothstep(start,1.0,z);'
    
    
    
    // .endl()+'       float c=(2.0*n)/(f+n-z*(f-n));'

    .endl()+'       float fogFactor = a*exp2( -density * '
    .endl()+'           density *'
    .endl()+'           z *'
    .endl()+'           z *'
    .endl()+'           LOG2);'
    
    // .endl()+'       fogFactor=smoothstep(0.8,1.0,fogFactor);'
    // .endl()+'       fogFactor*=2.0;'
    
    .endl()+'       #ifdef FOG_IGNORE_INFINITY'
    .endl()+'           if(z<0.001)'
    .endl()+'           {'
    .endl()+'               col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'           }'
    .endl()+'           else'
    .endl()+'       #endif'
    .endl()+'       {'
    .endl()+'           col=mix(colImg,vec4(r,g,b,1.0),fogFactor);'
    .endl()+'       }'
    .endl()+'   #endif'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','depthTex',1);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniDensity=new CGL.Uniform(shader,'f','density',1.0);
density.onValueChanged=function()
{
    uniDensity.setValue(density.get());
};
density.set(5.0);

{
    // fog color

    var r=op.addInPort(new Port(op,"fog r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onValueChanged=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=op.addInPort(new Port(op,"fog g",OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onValueChanged=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=op.addInPort(new Port(op,"fog b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onValueChanged=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

    var a=op.addInPort(new Port(op,"fog a",OP_PORT_TYPE_VALUE,{ display:'range' }));
    a.onValueChanged=function()
    {
        if(!a.uniform) a.uniform=new CGL.Uniform(shader,'f','a',a.get());
        else a.uniform.setValue(a.get());
    };

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}


var start=op.addInPort(new Port(op,"start",OP_PORT_TYPE_VALUE,{ display:'range' }));
start.onValueChanged=function()
{
    if(!start.uniform) start.uniform=new CGL.Uniform(shader,'f','start',start.get());
    else start.uniform.setValue(start.get());
};
start.set(0);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(image.get() && image.get().tex)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};