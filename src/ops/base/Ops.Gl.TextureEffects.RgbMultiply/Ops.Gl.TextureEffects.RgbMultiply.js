CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='RgbMultiply';

this.r=this.addInPort(new Port(this,"r"));
this.g=this.addInPort(new Port(this,"g"));
this.b=this.addInPort(new Port(this,"b"));
this.r.val=1.0;
this.g.val=1.0;
this.b.val=1.0;

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
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'
    .endl()+'       col.r*=r;'
    .endl()+'       col.g*=g;'
    .endl()+'       col.b*=b;'
    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniformR=new CGL.Uniform(shader,'f','r',1.0);
var uniformG=new CGL.Uniform(shader,'f','g',1.0);
var uniformB=new CGL.Uniform(shader,'f','b',1.0);

this.r.onValueChanged=function()
{
    uniformR.setValue(self.r.val);
};

this.g.onValueChanged=function()
{
    uniformG.setValue(self.g.val);
};

this.b.onValueChanged=function()
{
    uniformB.setValue(self.b.val);
};

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