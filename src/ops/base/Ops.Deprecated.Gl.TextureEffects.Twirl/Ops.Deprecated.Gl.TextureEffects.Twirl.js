
let render = op.inTrigger("render");
let amount = op.inValue("amount");


let times = op.inValue("times", 1);

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);


let srcFrag = ""
    .endl() + "IN vec2 texCoord;"
    .endl() + "UNI sampler2D tex;"
    .endl() + "UNI float amount;"
    .endl() + "UNI float times;"

    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec2 tc = texCoord.st-0.5;"

// .endl()+'   tc.x+=centerX;'

    .endl() + "   float angle = times*atan(tc.y,tc.x);"
    .endl() + "   float radius = length(tc);"
    .endl() + "   angle+= radius*amount*1.0;"
    .endl() + "   vec2 shifted = radius*vec2(cos(angle), sin(angle));"
    .endl() + "   vec4 col = texture2D(tex, (shifted+0.5));"

    .endl() + "   outColor= col;"
    .endl() + "}";

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let uniamount = new CGL.Uniform(shader, "f", "amount", 0);
let unitimes = new CGL.Uniform(shader, "f", "times", times);


render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    uniamount.setValue(amount.get() * (1 / texture.width));

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
