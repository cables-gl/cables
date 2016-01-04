CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='Vignette';

this.lensRadius1=this.addInPort(new Port(this,"lensRadius1"));
this.lensRadius2=this.addInPort(new Port(this,"lensRadius2"));
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
    .endl()+'uniform float lensRadius1;'
    .endl()+'uniform float lensRadius2;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'
    .endl()+'       vec2 tcPos=vec2(texCoord.x,texCoord.y/1.777+0.25);'

    .endl()+'       float dist = distance(tcPos, vec2(0.5,0.5));'
    .endl()+'       col.rgb *= smoothstep(lensRadius1, lensRadius2, dist);'
    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniLensRadius1=new CGL.Uniform(shader,'f','lensRadius1',0.4);
var uniLensRadius2=new CGL.Uniform(shader,'f','lensRadius2',0.3);

this.lensRadius1.onValueChanged=function()
{
    uniLensRadius1.setValue(self.lensRadius1.val);
};

this.lensRadius2.onValueChanged=function()
{
    uniLensRadius2.setValue(self.lensRadius2.val);
};

this.lensRadius1.val=0.8;
this.lensRadius2.val=0.4;

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
