
op.name='ColorLookup';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amount=op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE,{ display:'range' }));
var posy=op.addInPort(new Port(op,"posy",OP_PORT_TYPE_VALUE,{ display:'range' }));
var image=op.addInPort(new Port(op,"image",OP_PORT_TYPE_TEXTURE));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;
amount.set(1);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform sampler2D image;'
    .endl()+'  uniform float posy;'
    .endl()+'uniform float amount;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   vec4 colOrig=texture2D(tex,texCoord);'
    .endl()+'   col.r=texture2D(image,vec2(colOrig.r,posy)).r;'
    .endl()+'   col.g=texture2D(image,vec2(colOrig.g,posy)).g;'
    .endl()+'   col.b=texture2D(image,vec2(colOrig.b,posy)).b;'
    .endl()+'   col.a=1.0;'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);

var amountUniform=new CGL.Uniform(shader,'f','amount',amount.get());

amount.onValueChanged=function()
{
    amountUniform.setValue(amount.get());
};

var posyUniform=new CGL.Uniform(shader,'f','posy',posy.get());

posy.onValueChanged=function()
{
    posyUniform.setValue(posy.get());
};

posy.set(0.0);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(image.get() && image.get().tex)
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};