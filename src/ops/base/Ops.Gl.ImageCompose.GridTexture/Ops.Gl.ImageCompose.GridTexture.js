const render = op.inTrigger("render");
const blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
const amount = op.inFloatSlider("Amount", 1);

const lineThicknessX = op.inFloatSlider("Line thickness X", 0.4);
const lineThicknessY = op.inFloatSlider("Line thickness Y", 0.4);
const cellsX = op.inFloat("Cells X", 10);
const cellsY = op.inFloat("Cells Y", 10);
const inRotate = op.inFloatSlider("Rotate", 0.0);
const offsetX = op.inFloat("Offset X", 0.0);
const offsetY = op.inFloat("Offset Y", 0.0);

const invertColor = op.inBool("Invert color", false);
const r = op.inFloatSlider("Line red", Math.random());
const g = op.inFloatSlider("Line green", Math.random());
const b = op.inFloatSlider("Line Blue", Math.random());

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("LineThickness", [lineThicknessX, lineThicknessY]);
op.setPortGroup("Cells", [cellsX, cellsY]);
op.setPortGroup("Position", [inRotate, offsetX, offsetY]);

const trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.grid_frag);

const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

const uniInvertColor = new CGL.Uniform(shader, "b", "invertColor", invertColor);
const unilineThicknessX = new CGL.Uniform(shader, "f", "lineThicknessX", lineThicknessX);
const unilineThicknessY = new CGL.Uniform(shader, "f", "lineThicknessY", lineThicknessY);
const unicellsX = new CGL.Uniform(shader, "f", "cellsX", cellsX);
const unicellsY = new CGL.Uniform(shader, "f", "cellsY", cellsY);
const rotateUniform = new CGL.Uniform(shader, "f", "rotate", inRotate);
const offsetXUniform = new CGL.Uniform(shader, "f", "offsetX", offsetX);
const offsetYUniform = new CGL.Uniform(shader, "f", "offsetY", offsetY);

const uniformLineR = new CGL.Uniform(shader, "f", "lineR", r);
const uniformLineG = new CGL.Uniform(shader, "f", "lineG", g);
const uniformLineB = new CGL.Uniform(shader, "f", "lineB", b);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

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
