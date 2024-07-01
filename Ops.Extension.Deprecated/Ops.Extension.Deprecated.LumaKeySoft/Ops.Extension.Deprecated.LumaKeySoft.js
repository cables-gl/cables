op.name = "LumaKeySoft";
let cgl = op.patch.cgl;

let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let threshold = op.addInPort(new CABLES.Port(op, "amthresholdount", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let mul = op.inValue("Amount", 2.0);
threshold.set(0.5);

let shader = new CGL.Shader(cgl, op.name, op);

let srcFrag = ""
    .endl() + "precision highp float;"
    .endl() + "IN vec2 texCoord;"
    .endl() + "uniform sampler2D tex;"
    .endl() + "uniform float threshhold;"
    .endl() + "uniform float mul;"

    .endl() + "uniform sampler2D text;"

    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec4 col = texture2D(text, texCoord );"

    .endl() + "   float gray = dot(vec3(0.2126,0.7152,0.0722), col.rgb );"
    .endl() + "   if(gray < threshhold) col=col-(threshhold-gray)*mul;"
    .endl() + "   gl_FragColor = col;"

    .endl() + "}";

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let unThreshold = new CGL.Uniform(shader, "f", "threshhold", threshold);
let unMul = new CGL.Uniform(shader, "f", "mul", mul);

render.onTriggered = function ()
{
    if (!cgl.currentTextureEffect) return;

    // unThreshold.setValue( threshold.get() );

    cgl.pushShader(shader);

    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();

    cgl.popShader();
    trigger.trigger();
};
