op.name="LumaKeySoft";
var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var threshold=op.addInPort(new Port(op,"amthresholdount",OP_PORT_TYPE_VALUE,{display:'range'}));
var mul=op.inValue("Amount",2.0);
threshold.set(0.5);


var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float threshhold;'
    .endl()+'uniform float mul;'

    .endl()+'uniform sampler2D text;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col = texture2D(text, texCoord );'

    .endl()+'   float gray = dot(vec3(0.2126,0.7152,0.0722), col.rgb );'
    .endl()+'   if(gray < threshhold) col=col-(threshhold-gray)*mul;'
    .endl()+'   gl_FragColor = col;'

    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var unThreshold=new CGL.Uniform(shader,'f','threshhold',threshold);
var unMul=new CGL.Uniform(shader,'f','mul',mul);

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
