op.name="ChromaticAberrationNew";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var pixel=op.inValue("Pixel",5);
var lensDistort=op.inValueSlider("Lens Distort",0);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float pixel;'
    .endl()+'uniform float onePixel;'
    .endl()+'uniform float amount;'
    .endl()+'uniform float lensDistort;'

    .endl()+'void main()'
    .endl()+'{'
    
    
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   vec4 colOrig=texture2D(tex,texCoord);'
    
    .endl()+'       vec2 tc=texCoord;;'
    .endl()+'       float pix = pixel;'
    .endl()+'       if(lensDistort>0.0)'
    .endl()+'       {'
    .endl()+'           float dist = distance(texCoord, vec2(0.5,0.5));'
    .endl()+'           tc-=0.5;'
    
    .endl()+'           tc *=smoothstep(-0.9,1.0*lensDistort,1.0-dist);'

    .endl()+'           tc+=0.5;'
    // .endl()+'           pix+=pixel;'
    .endl()+'       }'

    
    .endl()+'   col.r=texture2D(tex,vec2(tc.x+pix,tc.y)).r;'
    .endl()+'   col.b=texture2D(tex,vec2(tc.x-pix,tc.y)).b;'


.endl()+'   gl_FragColor = col;;'
    // .endl()+'   gl_FragColor = (colOrig+col)/2.0;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniPixel=new CGL.Uniform(shader,'f','pixel',0);
var uniOnePixel=new CGL.Uniform(shader,'f','onePixel',0);

var unilensDistort=new CGL.Uniform(shader,'f','lensDistort',lensDistort);



render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniPixel.setValue(pixel.get()*(1/texture.width));
    uniOnePixel.setValue(1/texture.width);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
