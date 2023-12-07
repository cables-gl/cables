const cgl = op.patch.cgl;
const render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "blendMode"),
    inAmount = op.inFloatSlider("Amount", 1),
    image = op.inTexture("Depth Texture"),
    inGradientTexture = op.inTexture("Gradient Texture"),
    inBgTex = op.inTexture("Background Texture"),
    inFogStart = op.inFloat("Fog Start", 1),
    inFogEnd = op.inFloat("Fog End", 8),
    inFogDensity = op.inFloatSlider("Fog Density", 1),
    inIgnoreInf = op.inBool("Ignore Infinity", false),
    nearPlane = op.inFloat("nearplane", 0.1),
    farPlane = op.inFloat("farplane", 20),
    inFogR = op.inFloatSlider("Fog R", 0.6),
    inFogG = op.inFloatSlider("Fog G", 0.6),
    inFogB = op.inFloatSlider("Fog B", 0.6),
    inFogA = op.inFloatSlider("Fog A", 1),
    trigger = op.outTrigger("trigger");

inFogR.setUiAttribs({ "colorPick": true });

op.setPortGroup("Textures", [image, inGradientTexture, inBgTex]);
op.setPortGroup("Frustum", [farPlane, nearPlane]);
op.setPortGroup("Fog Options", [inFogStart, inFogEnd, inFogDensity]);
op.setPortGroup("Fog Color", [inFogR, inFogG, inFogB, inFogA]);

const shader = new CGL.Shader(cgl, "Fog");
const srcFrag = attachments.fog_frag;
const srcVert = attachments.fog_vert;
shader.setSource(srcVert, srcFrag);

const
    uniAmount = new CGL.Uniform(shader, "f", "inAmount", inAmount),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    depthTextureUniform = new CGL.Uniform(shader, "t", "texDepth", 1),
    uniGradientTexture = new CGL.Uniform(shader, "t", "texGradient", 2),
    uniBgTexture = new CGL.Uniform(shader, "t", "texBg", 3),
    uniFarplane = new CGL.Uniform(shader, "f", "farPlane", farPlane),
    uniNearplane = new CGL.Uniform(shader, "f", "nearPlane", nearPlane),
    uniAspect = new CGL.Uniform(shader, "f", "aspectRatio", 0),
    uniFogColor = new CGL.Uniform(shader, "4f", "inFogColor", inFogR, inFogG, inFogB, inFogA),
    uniFogDensity = new CGL.Uniform(shader, "f", "inFogDensity", inFogDensity),
    uniFogStart = new CGL.Uniform(shader, "f", "inFogStart", inFogStart),
    uniFogEnd = new CGL.Uniform(shader, "f", "inFogEnd", inFogEnd);

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
    shader.toggleDefine("IGNORE_INF", inIgnoreInf.get());
    shader.toggleDefine("HAS_GRADIENT_TEX", inGradientTexture.get() && inGradientTexture.get().tex);
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;
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
