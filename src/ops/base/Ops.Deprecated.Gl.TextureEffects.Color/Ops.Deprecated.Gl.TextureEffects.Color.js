op.name='Color';
var render=op.inTrigger('render');
var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect color');



var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
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
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex );


    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

// op.name='Color';
// var render=op.inTrigger('render');


// var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
// var amount=op.inValueSlider("Amount",1);


// var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
// var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
// var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
// var a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
// var trigger=op.outTrigger('trigger');

// var cgl=op.patch.cgl;
// var shader=new CGL.Shader(cgl,'textureeffect color');



// var srcFrag=''+
//     CGL.TextureEffect.getBlendCode()
//     .endl()+'precision highp float;'
//     .endl()+'#ifdef HAS_TEXTURES'
//     .endl()+'  IN vec2 texCoord;'
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

//     cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
//

//     cgl.currentTextureEffect.finish();
//     cgl.setPreviousShader();

//     trigger.trigger();
// };
