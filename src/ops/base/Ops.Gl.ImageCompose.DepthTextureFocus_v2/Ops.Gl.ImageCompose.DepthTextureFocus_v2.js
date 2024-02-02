const render = op.inTrigger("render");
const depthTexture = op.inTexture("Depth Texture");

const inFocus = op.inFloat("Focus", 0.5);
const inWidth = op.inFloat("Width", 0.2);
const inInv = op.inBool("Invert", false);
const nearPlane = op.inFloat("nearplane", 0.1);
const farPlane = op.inFloat("farplane", 100);

const trigger = op.outTrigger("trigger");

op.setPortGroup("Frustum", [farPlane, nearPlane]);
op.setPortGroup("Focus Settings", [inInv, inFocus, inWidth]);

const cgl = op.patch.cgl;

const shader = new CGL.Shader(cgl, op.name, op);
const srcFrag = attachments.depth_focus_frag || "";
shader.setSource(shader.getDefaultVertexShader(), srcFrag);

const textureUniform = new CGL.Uniform(shader, "t", "depthTexture", 0);
const uniFarplane = new CGL.Uniform(shader, "f", "farPlane", farPlane);
const uniNearplane = new CGL.Uniform(shader, "f", "nearPlane", nearPlane);
const uniFocus = new CGL.Uniform(shader, "f", "focus", inFocus);
const uniwidth = new CGL.Uniform(shader, "f", "width", inWidth);
const uniAspect = new CGL.Uniform(shader, "f", "aspectRatio", 0);

inInv.onChange = function ()
{
    if (inInv.get())shader.define("INVERT");
    else shader.removeDefine("INVERT");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    if (depthTexture.get() && depthTexture.get().tex)
    {
        const a =
            cgl.currentTextureEffect.getCurrentSourceTexture().height
            / cgl.currentTextureEffect.getCurrentSourceTexture().width;

        uniAspect.set(a);

        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, depthTexture.get().tex);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
