op.name='Color';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect color');

op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(r,g,b,a);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);

var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformA=new CGL.Uniform(shader,'f','a',a);

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

// op.name='Color';
// var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));


// var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
// var amount=op.inValueSlider("Amount",1);


// var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
// var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
// var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
// var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));
// var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

// var cgl=op.patch.cgl;
// var shader=new CGL.Shader(cgl,'textureeffect color');

// op.onLoaded=shader.compile;

// var srcFrag=''+
//     CGL.TextureEffect.getBlendCode()
//     .endl()+'precision highp float;'
//     .endl()+'#ifdef HAS_TEXTURES'
//     .endl()+'  varying vec2 texCoord;'
//     .endl()+'  uniform sampler2D tex;'
//     .endl()+'#endif'
//     .endl()+'uniform float r;'
//     .endl()+'uniform float g;'
//     .endl()+'uniform float b;'
//     .endl()+'uniform float a;'
//     .endl()+'uniform float amount;'
//     .endl()+''
//     .endl()+'void main()'
//     .endl()+'{'
//     .endl()+'   vec4 col=vec4(r,g,b,a);'

//     .endl()+'if(amount>0.0)'
//     .endl()+'{'
//     .endl()+'   vec4 base=texture2D(tex,texCoord);'
//     .endl()+'   col=vec4( _blend(base.rgb,col.rgb) ,1.0);'
//     .endl()+'   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);'
    
//     .endl()+'}'
    

   

//     .endl()+'   gl_FragColor = col;'
//     .endl()+'}';

// shader.setSource(shader.getDefaultVertexShader(),srcFrag);
// var textureUniform=new CGL.Uniform(shader,'t','tex',0);
// r.set(1.0);
// g.set(1.0);
// b.set(1.0);
// a.set(1.0);

// var uniformR=new CGL.Uniform(shader,'f','r',r);
// var uniformG=new CGL.Uniform(shader,'f','g',g);
// var uniformB=new CGL.Uniform(shader,'f','b',b);
// var uniformA=new CGL.Uniform(shader,'f','a',a);

// var amountUniform=new CGL.Uniform(shader,'f','amount',amount);


// blendMode.onChange=function()
// {
//     CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
// };


// render.onTriggered=function()
// {
//     if(!cgl.currentTextureEffect)return;

//     cgl.setShader(shader);
//     cgl.currentTextureEffect.bind();

//     cgl.gl.activeTexture(cgl.gl.TEXTURE0);
//     cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

//     cgl.currentTextureEffect.finish();
//     cgl.setPreviousShader();

//     trigger.trigger();
// };