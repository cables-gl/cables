op.name="PixelDisplacementCenter";

var render=op.inTrigger('render');

var amount=op.addInPort(new CABLES.Port(op,"amountX",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var amountY=op.addInPort(new CABLES.Port(op,"amountY",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var displaceTex=op.inTexture("displaceTex");
var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl);


var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform sampler2D displaceTex;'
    .endl()+'#endif'
    .endl()+'uniform float amountX;'
    .endl()+'uniform float amountY;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+' float mulX=1.0;'
    .endl()+' float mulY=1.0;'
    .endl()+' float x=mod(texCoord.x+mulX*(texture2D(displaceTex,texCoord).g-0.5)*2.0*amountX,1.0);'
    .endl()+' float y=mod(texCoord.y+mulY*(texture2D(displaceTex,texCoord).g-0.5)*2.0*amountY,1.0);'
    .endl()+''
    .endl()+'       col=texture2D(tex,vec2(x,y) );'
    // .endl()+'       col.rgb=desaturate(col.rgb,amount);'
    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','displaceTex',1);

var amountXUniform=new CGL.Uniform(shader,'f','amountX',amount);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    

    if(displaceTex.get())
    {
        cgl.setTexture(1,displaceTex.get().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, displaceTex.get().tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

