const cgl = op.patch.cgl;

const render = op.inTrigger("render");
const blendMode = CGL.TextureEffect.AddBlendSelect(op, "blendMode");
const inAmount = op.inFloatSlider("Amount", 1);
const image = op.inTexture("Depth Texture");
const inGradientTexture = op.inTexture("Gradient Texture");
const inBgTex = op.inTexture("Background Texture");
const inFogStart = op.inFloat("Fog Start", 1);
const inFogEnd = op.inFloat("Fog End", 8);
const inFogDensity = op.inFloatSlider("Fog Density", 1);
const nearPlane = op.inFloat("nearplane", 0.1);
const farPlane = op.inFloat("farplane", 20);
const inFogR = op.inFloatSlider("Fog R", 0.6);
const inFogG = op.inFloatSlider("Fog G", 0.6);
const inFogB = op.inFloatSlider("Fog B", 0.6);
const inFogA = op.inFloatSlider("Fog A", 1);
inFogR.setUiAttribs({ "colorPick": true });

const trigger = op.outTrigger("trigger");

op.setPortGroup("Textures", [image, inGradientTexture, inBgTex]);
op.setPortGroup("Frustum", [farPlane, nearPlane]);
op.setPortGroup("Fog Options", [inFogStart, inFogEnd, inFogDensity]);
op.setPortGroup("Fog Color", [inFogR, inFogG, inFogB, inFogA]);

const shader = new CGL.Shader(cgl, "Fog");
const srcFrag = attachments.fog_frag;
const srcVert = attachments.fog_vert;
shader.setSource(srcVert, srcFrag);

const uniAmount = new CGL.Uniform(shader, "f", "inAmount", inAmount);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const depthTextureUniform = new CGL.Uniform(shader, "t", "texDepth", 1);
const uniGradientTexture = new CGL.Uniform(shader, "t", "texGradient", 2);
const uniBgTexture = new CGL.Uniform(shader, "t", "texBg", 3);

const uniFarplane = new CGL.Uniform(shader, "f", "farPlane", farPlane);
const uniNearplane = new CGL.Uniform(shader, "f", "nearPlane", nearPlane);

const uniAspect = new CGL.Uniform(shader, "f", "aspectRatio", 0);
const uniFogColor = new CGL.Uniform(shader, "4f", "inFogColor", inFogR, inFogG, inFogB, inFogA);
const uniFogDensity = new CGL.Uniform(shader, "f", "inFogDensity", inFogDensity);
const uniFogStart = new CGL.Uniform(shader, "f", "inFogStart", inFogStart);
const uniFogEnd = new CGL.Uniform(shader, "f", "inFogEnd", inFogEnd);

CGL.TextureEffect.setupBlending(op, shader, blendMode, inAmount);

let texturesChanged = false;
inGradientTexture.onChange =
inBgTex.onChange = () =>
{
    texturesChanged = true;
};

function updateDefines()
{
    shader.toggleDefine("HAS_BG_TEX", inBgTex.get() && inBgTex.get().tex);

    if (inGradientTexture.get() && inGradientTexture.get().tex) shader.define("HAS_GRADIENT_TEX");
    else shader.removeDefine("HAS_GRADIENT_TEX");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!image.get())
    {
        op.setUiError("noDepthTex", "This op needs a depth texture to work properly!", 0);
    }
    else
    {
        op.setUiError("noDepthTex", null);
    }

    if (texturesChanged)updateDefines();

    if (image.get() && image.get().tex)
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
        if (inBgTex.get()) cgl.setTexture(3, inBgTex.get().tex);
        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
