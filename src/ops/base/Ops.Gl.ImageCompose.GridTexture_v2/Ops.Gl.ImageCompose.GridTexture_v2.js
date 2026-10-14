const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),

    amount = op.inFloatSlider("Amount", 1),

    lineThicknessX = op.inFloatSlider("Line thickness X", 0.4),
    lineThicknessY = op.inFloatSlider("Line thickness Y", 0.4),
    cellsX = op.inFloat("Cells X", 10),
    cellsY = op.inFloat("Cells Y", 10),
    inRotate = op.inFloatSlider("Rotate", 0.0),
    offsetX = op.inFloat("Offset X", 0.0),
    offsetY = op.inFloat("Offset Y", 0.0),

    invertColor = op.inBool("Invert color", false),
    r = op.inFloatSlider("Line red", Math.random()),
    g = op.inFloatSlider("Line green", Math.random()),
    b = op.inFloatSlider("Line Blue", Math.random());

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("LineThickness", [lineThicknessX, lineThicknessY]);
op.setPortGroup("Cells", [cellsX, cellsY]);
op.setPortGroup("Position", [inRotate, offsetX, offsetY]);

const trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.grid_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniInvertColor = new CGL.Uniform(shader, "b", "invertColor", invertColor),
    unilineThicknessX = new CGL.Uniform(shader, "f", "lineThicknessX", lineThicknessX),
    unilineThicknessY = new CGL.Uniform(shader, "f", "lineThicknessY", lineThicknessY),
    unicellsX = new CGL.Uniform(shader, "f", "cellsX", cellsX),
    unicellsY = new CGL.Uniform(shader, "f", "cellsY", cellsY),
    rotateUniform = new CGL.Uniform(shader, "f", "rotate", inRotate),
    offsetXUniform = new CGL.Uniform(shader, "f", "offsetX", offsetX),
    offsetYUniform = new CGL.Uniform(shader, "f", "offsetY", offsetY),
    uniformLineR = new CGL.Uniform(shader, "f", "lineR", r),
    uniformLineG = new CGL.Uniform(shader, "f", "lineG", g),
    uniformLineB = new CGL.Uniform(shader, "f", "lineB", b);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

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
