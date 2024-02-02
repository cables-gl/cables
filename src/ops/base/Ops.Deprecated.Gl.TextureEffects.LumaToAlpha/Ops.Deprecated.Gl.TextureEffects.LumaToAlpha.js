let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let amount = op.inValueSlider("amount", 1);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);


let srcFrag = ""

    .endl() + "IN vec2 texCoord;"
    .endl() + "uniform sampler2D tex;"
    .endl() + "uniform float amount;"
    .endl() + ""
    .endl() + "float luma(vec3 color)"
    .endl() + "{"
    .endl() + "   vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), color));"
    .endl() + "   return gray.r;"
    .endl() + "}"
    .endl() + ""
    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec4 col=vec4(1.0,0.0,0.0,1.0);"
    .endl() + "   col=texture2D(tex,texCoord);"
    .endl() + "   col.a=luma(col.rgb);"
    .endl() + "   col.rgb=vec3(1.0,1.0,1.0);"

    .endl() + "   outColor= col;"
    .endl() + "}";

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let amountUniform = new CGL.Uniform(shader, "f", "amount", amount.get());

amount.onChange = function ()
{
    amountUniform.setValue(amount.get());
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);


    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
