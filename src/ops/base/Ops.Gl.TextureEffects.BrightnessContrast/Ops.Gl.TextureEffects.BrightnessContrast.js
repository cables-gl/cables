CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='BrightnessContrast';

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.amount=this.addInPort(new Port(this,"contrast",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.amountBright=this.addInPort(new Port(this,"brightness",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float amount;'
    .endl()+'uniform float amountbright;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'

    .endl()+'       // apply contrast'
    .endl()+'       col.rgb = ((col.rgb - 0.5) * max(amount*2.0, 0.0))+0.5;'

    .endl()+'       // apply brightness'
    .endl()+'       col.rgb *= amountbright*2.0;'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',0.4);
var amountBrightUniform=new CGL.Uniform(shader,'f','amountbright',0.5);

this.amount.onValueChanged=function()
{
    console.log('amount changed! '+self.amount.val);
    amountUniform.setValue(self.amount.val);
};

this.amountBright.onValueChanged=function()
{
    amountBrightUniform.setValue(self.amountBright.val);
};


this.amountBright.val=0.5;
this.amount.val=0.5;

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