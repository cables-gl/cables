
op.name='ChromaticAberration';

var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var amount=op.addInPort(new CABLES.Port(op,"amount",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  UNI sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float amount;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'
    .endl()+'       vec2 tcPos=vec2(texCoord.x,texCoord.y/1.777+0.25);'
    .endl()+'       float dist = distance(tcPos, vec2(0.5,0.5));'
    .endl()+'       col.r=texture2D(tex,texCoord+(dist)*-amount).r;'
    .endl()+'       col.b=texture2D(tex,texCoord+(dist)*amount).b;'
    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniAmount=new CGL.Uniform(shader,'f','amount',0);

amount.onValueChanged=function()
{
    uniAmount.setValue(amount.get()*0.1);
};
amount.set(0.5);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
