op.name="LumaKey";
var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var threshold=op.addInPort(new Port(op,"amthresholdount",OP_PORT_TYPE_VALUE,{display:'range'}));
threshold.set(0.5);

var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float threshhold;'

    .endl()+'uniform sampler2D texture;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col = texture2D(texture, texCoord );'

    .endl()+'   float gray = dot(vec3(0.2126,0.7152,0.0722), col.rgb );'
    .endl()+'   if(gray < threshhold) col.r=col.g=col.b=col.a=0.0;'
    // .endl()+'   col.r=threshhold;'
    // .endl()+'   col.g=threshhold;'

    .endl()+'   gl_FragColor = col;'

    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var unThreshold=new CGL.Uniform(shader,'f','threshhold',threshold);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;


// unThreshold.setValue( threshold.get() );


    cgl.setShader(shader);


    cgl.currentTextureEffect.bind();
    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();

    cgl.setPreviousShader();
    trigger.trigger();
};