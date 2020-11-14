const cgl = op.patch.cgl;

const render = op.inTrigger("render");
const blendMode = CGL.TextureEffect.AddBlendSelect(op, "blendMode");
const inAmount = op.inFloatSlider("Amount", 1);
const image = op.inTexture("Depth Texture");
const inGradientTexture = op.inTexture("Gradient Texture");
const inFogStart = op.inFloat("Fog Start", 1);
const inFogEnd = op.inFloat("Fog End", 8);
const inFogDensity = op.inFloatSlider("Fog Density", 1);
const inFogMode = op.inSwitch("Fog Mode", ["Default", "Linear", "Exp", "Exp2"], "Default");
const nearPlane = op.inValue("nearplane", 0.1);
const farPlane = op.inValue("farplane", 10);
const inFogR = op.inFloatSlider("Fog R", Math.random());
const inFogG = op.inFloatSlider("Fog G", Math.random());
const inFogB = op.inFloatSlider("Fog B", Math.random());
const inFogA = op.inFloatSlider("Fog A", 1);
inFogR.setUiAttribs({ "colorPick": true });

const trigger = op.outTrigger("trigger");

op.setPortGroup("Textures", [image, inGradientTexture]);
op.setPortGroup("Frustum", [farPlane, nearPlane]);
op.setPortGroup("Fog Options", [inFogStart, inFogEnd, inFogMode, inFogDensity]);
op.setPortGroup("Fog Color", [inFogR, inFogG, inFogB, inFogA]);

const shader = new CGL.Shader(cgl, "Fog");
const srcFrag = attachments.fog_frag;
const srcVert = attachments.fog_vert;
shader.setSource(srcVert, srcFrag);

const uniAmount = new CGL.Uniform(shader, "f", "inAmount", inAmount);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const depthTextureUniform = new CGL.Uniform(shader, "t", "texDepth", 1);
const uniGradientTexture = new CGL.Uniform(shader, "t", "texGradient", 2);

const uniFarplane = new CGL.Uniform(shader, "f", "farPlane", farPlane);
const uniNearplane = new CGL.Uniform(shader, "f", "nearPlane", nearPlane);

const uniAspect = new CGL.Uniform(shader, "f", "aspectRatio", 0);
const uniFogColor = new CGL.Uniform(shader, "4f", "inFogColor", inFogR, inFogG, inFogB, inFogA);
const uniFogDensity = new CGL.Uniform(shader, "f", "inFogDensity", inFogDensity);
const uniFogStart = new CGL.Uniform(shader, "f", "inFogStart", inFogStart);
const uniFogEnd = new CGL.Uniform(shader, "f", "inFogEnd", inFogEnd);

inGradientTexture.onChange = () =>
{
    if (inGradientTexture.get() && inGradientTexture.get().tex) shader.define("HAS_GRADIENT_TEX");
    else shader.removeDefine("HAS_GRADIENT_TEX");
};

inFogMode.onChange = () =>
{
    shader.toggleDefine("FOG_MODE_DEFAULT", inFogMode.get() === "Default");
    shader.toggleDefine("FOG_MODE_LINEAR", inFogMode.get() === "Linear");
    shader.toggleDefine("FOG_MODE_EXP", inFogMode.get() === "Exp");
    shader.toggleDefine("FOG_MODE_EXP2", inFogMode.get() === "Exp2");
};

CGL.TextureEffect.setupBlending(op, shader, blendMode, inAmount);

shader.toggleDefine("FOG_MODE_DEFAULT", inFogMode.get() === "Default");
shader.toggleDefine("FOG_MODE_LINEAR", inFogMode.get() === "Linear");
shader.toggleDefine("FOG_MODE_EXP", inFogMode.get() === "Exp");
shader.toggleDefine("FOG_MODE_EXP2", inFogMode.get() === "Exp2");

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    if (image.val && image.val.tex)
    {
        const a =
            cgl.currentTextureEffect.getCurrentSourceTexture().height
            / cgl.currentTextureEffect.getCurrentSourceTexture().width;

        uniAspect.set(a);

        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
        if (image.get()) cgl.setTexture(1, image.get().tex);
        if (inGradientTexture.get()) cgl.setTexture(2, inGradientTexture.get().tex);
        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
