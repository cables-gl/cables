op.name="Interlace";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amount=op.inValueSlider("amount",0.5);//op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE,{display:'range'}));
var lum=op.inValueSlider("Lumi Scale",0.9);
var lineSize=op.inValue("Line Size",2);

var add=op.inValue("Add",0.02);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float amount;'
    .endl()+'uniform float lum;'
    .endl()+'uniform float add;'
    .endl()+'uniform float lineSize;'
    .endl()+''

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'

    .endl()+'   col=texture2D(tex,texCoord);'
    .endl()+'   col=clamp(col,0.0,1.0);'
    .endl()+'   if( mod(gl_FragCoord.y,lineSize)>=lineSize*0.5)'
    .endl()+'   {'
    .endl()+'       float gray = vec3(dot(vec3(0.2126,0.7152,0.0722), col.rgb)).r;'
    .endl()+'       col.rgb=col.rgb*(1.0-amount) + (col.rgb*gray*gray*lum)*amount;'
    .endl()+'   }'
    .endl()+'   else col+=add;'
    

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniAmount=new CGL.Uniform(shader,'f','amount',amount);

var uniLum=new CGL.Uniform(shader,'f','lum',lum);
var uniLineSize=new CGL.Uniform(shader,'f','lineSize',lineSize);
var uniAdd=new CGL.Uniform(shader,'f','add',add);



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
