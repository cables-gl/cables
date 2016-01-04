CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='ColorLookup';

this.amount=this.addInPort(new Port(this,"amount",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.posy=this.addInPort(new Port(this,"posy",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.image=this.addInPort(new Port(this,"image",OP_PORT_TYPE_TEXTURE));
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform sampler2D image;'
    .endl()+'  uniform float posy;'
    .endl()+'#endif'
    .endl()+'uniform float amount;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'
    .endl()+'       col.r=col.r*(1.0-amount)+texture2D(image,vec2(col.r,posy)).r*amount;'
    .endl()+'       col.g=col.g*(1.0-amount)+texture2D(image,vec2(col.g,posy)).g*amount;'
    .endl()+'       col.b=col.b*(1.0-amount)+texture2D(image,vec2(col.b,posy)).b*amount;'
    .endl()+'   #endif'
    .endl()+'   col.a=1.0;'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);

var amountUniform=new CGL.Uniform(shader,'f','amount',1.0);

this.amount.onValueChanged=function()
{
    amountUniform.setValue(self.amount.val);
};

var posyUniform=new CGL.Uniform(shader,'f','posy',0.0);

this.posy.onValueChanged=function()
{
    posyUniform.setValue(self.posy.val);
};

this.posy.val=0.0;

this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(self.image.val && self.image.val.tex)
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.image.val.tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    self.trigger.trigger();
};