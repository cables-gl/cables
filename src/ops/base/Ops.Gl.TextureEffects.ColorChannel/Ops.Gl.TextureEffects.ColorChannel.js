CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='ColorChannel';

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
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

this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    self.trigger.trigger();
};

this.channelR=this.addInPort(new Port(this,"channelR",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.channelR.onValueChanged=function()
{
    if(self.channelR.val) shader.define('CHANNEL_R');
        else shader.removeDefine('CHANNEL_R');
};
this.channelR.val=true;

this.channelG=this.addInPort(new Port(this,"channelG",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.channelG.val=false;
this.channelG.onValueChanged=function()
{
    if(self.channelG.val)shader.define('CHANNEL_G');
        else shader.removeDefine('CHANNEL_G');
};


this.channelB=this.addInPort(new Port(this,"channelB",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.channelB.val=false;
this.channelB.onValueChanged=function()
{
    if(self.channelB.val) shader.define('CHANNEL_B');
        else shader.removeDefine('CHANNEL_B');
};

this.mono=this.addInPort(new Port(this,"mono",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.mono.val=false;
this.mono.onValueChanged=function()
{
    if(self.mono.val) shader.define('MONO');
        else shader.removeDefine('MONO');
};