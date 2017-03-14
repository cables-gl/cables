op.name="Levels";

var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));

var inMin=op.inValueSlider("In Min",0);
var inMid=op.inValueSlider("Midpoint",0.5);
var inMax=op.inValueSlider("In Max",1);

var outMin=op.inValueSlider("Out Min",0);
var outMax=op.inValueSlider("Out Max",1);

var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var uniInMin=new CGL.Uniform(shader,'f','inMin',inMin);
var uniInMid=new CGL.Uniform(shader,'f','midPoint',inMid);
var uniInMax=new CGL.Uniform(shader,'f','inMax',inMax);

var uniOutMin=new CGL.Uniform(shader,'f','outMin',outMin);
var uniOutMax=new CGL.Uniform(shader,'f','outMax',outMax);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'

    .endl()+'uniform float inMin;'
    .endl()+'uniform float inMax;'
    .endl()+'uniform float midPoint;'
    .endl()+'uniform float outMax;'
    .endl()+'uniform float outMin;'
    
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 base=texture2D(tex,texCoord);'

	.endl()+'   vec4 inputRange = min(max(base - vec4(inMin), vec4(0.0)) / (vec4(inMax) - vec4(inMin)), vec4(outMax));'
	.endl()+'   inputRange = pow(inputRange, vec4(1.0 / (1.5 - midPoint)));'

	.endl()+'   gl_FragColor = mix(vec4(outMin), vec4(1.0), inputRange);'

    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

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

