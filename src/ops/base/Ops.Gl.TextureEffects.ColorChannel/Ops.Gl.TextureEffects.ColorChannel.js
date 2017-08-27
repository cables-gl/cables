op.name='ColorChannel';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'

    .endl()+'   #ifdef CHANNEL_R'
    .endl()+'       col.r=texture2D(tex,texCoord).r;'
    .endl()+'       #ifdef MONO'
    .endl()+'           col.g=col.b=col.r;'
    .endl()+'       #endif'
    .endl()+'   #endif'

    .endl()+'   #ifdef CHANNEL_G'
    .endl()+'       col.g=texture2D(tex,texCoord).g;'
    .endl()+'       #ifdef MONO'
    .endl()+'           col.r=col.b=col.g;'
    .endl()+'       #endif'
    .endl()+'   #endif'

    .endl()+'   #ifdef CHANNEL_B'
    .endl()+'       col.b=texture2D(tex,texCoord).b;'
    .endl()+'       #ifdef MONO'
    .endl()+'           col.g=col.r=col.b;'
    .endl()+'       #endif'
    .endl()+'   #endif'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

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


var channelR=op.addInPort(new Port(op,"channelR",OP_PORT_TYPE_VALUE,{ display:'bool' }));
channelR.onValueChanged=function()
{
    if(channelR.get()) shader.define('CHANNEL_R');
        else shader.removeDefine('CHANNEL_R');
};
channelR.set(true);

var channelG=op.addInPort(new Port(op,"channelG",OP_PORT_TYPE_VALUE,{ display:'bool' }));
channelG.set(false);
channelG.onValueChanged=function()
{
    if(channelG.get())shader.define('CHANNEL_G');
        else shader.removeDefine('CHANNEL_G');
};


var channelB=op.addInPort(new Port(op,"channelB",OP_PORT_TYPE_VALUE,{ display:'bool' }));
channelB.set(false);
channelB.onValueChanged=function()
{
    if(channelB.get()) shader.define('CHANNEL_B');
        else shader.removeDefine('CHANNEL_B');
};

var mono=op.addInPort(new Port(op,"mono",OP_PORT_TYPE_VALUE,{ display:'bool' }));
mono.set(false);
mono.onValueChanged=function()
{
    if(mono.get()) shader.define('MONO');
        else shader.removeDefine('MONO');
};

