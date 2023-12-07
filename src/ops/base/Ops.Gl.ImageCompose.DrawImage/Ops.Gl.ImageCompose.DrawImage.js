const render = op.inTrigger("render");
const amount = op.inFloatSlider("amount");
const blendMode = CGL.TextureEffect.AddBlendSelect(op, "blendMode");

const image = op.inTexture("image");

const imageAlpha = op.inTexture("imageAlpha");
const alphaSrc = op.inValueSelect("alphaSrc", ["alpha channel", "luminance"]);
const removeAlphaSrc = op.inValueBool("removeAlphaSrc");

const invAlphaChannel = op.inValueBool("invert alpha channel");
const trigger = op.outTrigger("trigger");

op.toWorkPortsNeedToBeLinked(image);

blendMode.set("normal");
const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "drawimage");

amount.set(1.0);

render.onTriggered = doRender;

shader.setSource(attachments.drawimage_vert, attachments.drawimage_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const textureDisplaceUniform = new CGL.Uniform(shader, "t", "image", 1);
const textureAlpha = new CGL.Uniform(shader, "t", "imageAlpha", 2);

invAlphaChannel.onChange = function ()
{
    if (invAlphaChannel.get()) shader.define("INVERT_ALPHA");
    else shader.removeDefine("INVERT_ALPHA");
};

removeAlphaSrc.onChange = function ()
{
    if (removeAlphaSrc.get()) shader.define("REMOVE_ALPHA_SRC");
    else shader.removeDefine("REMOVE_ALPHA_SRC");
};
removeAlphaSrc.set(true);

alphaSrc.onChange = function ()
{
    if (alphaSrc.get() == "luminance") shader.define("ALPHA_FROM_LUMINANCE");
    else shader.removeDefine("ALPHA_FROM_LUMINANCE");
};

alphaSrc.set("alpha channel");

{
    //
    // texture flip
    //
    const flipX = op.inValueBool("flip x");
    const flipY = op.inValueBool("flip y");

    flipX.onChange = function ()
    {
        if (flipX.get()) shader.define("TEX_FLIP_X");
        else shader.removeDefine("TEX_FLIP_X");
    };

    flipY.onChange = function ()
    {
        if (flipY.get()) shader.define("TEX_FLIP_Y");
        else shader.removeDefine("TEX_FLIP_Y");
    };
}

{
    //
    // texture transform
    //
    const scale = op.inValueFloat("scale");
    const posX = op.inValueFloat("pos x");
    const posY = op.inValueFloat("pos y");
    const rotate = op.inValueFloat("rotate");

    scale.set(1.0);

    const uniScale = new CGL.Uniform(shader, "f", "scale", scale.get());
    const uniPosX = new CGL.Uniform(shader, "f", "posX", posX.get());
    const uniPosY = new CGL.Uniform(shader, "f", "posY", posY.get());
    const uniRotate = new CGL.Uniform(shader, "f", "rotate", rotate.get());

    function updateTransform()
    {
        if (scale.get() != 1.0 || posX.get() != 0.0 || posY.get() != 0.0 || rotate.get() != 0.0)
        {
            if (!shader.hasDefine("TEX_TRANSFORM")) shader.define("TEX_TRANSFORM");
            uniScale.setValue(parseFloat(scale.get()));
            uniPosX.setValue(posX.get());
            uniPosY.setValue(posY.get());
            uniRotate.setValue(rotate.get());
        }
        else
        {
            // shader.removeDefine('TEX_TRANSFORM');
        }
    }

    scale.onChange = updateTransform;
    posX.onChange = updateTransform;
    posY.onChange = updateTransform;
    rotate.onChange = updateTransform;
}

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
let oldHadImageAlpha = false;

// op.preRender=function()
// {
//     doRender();
// };

function doRender()
{
    // if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if (imageAlpha.get() && !oldHadImageAlpha || !imageAlpha.get() && oldHadImageAlpha)
    {
        if (imageAlpha.get() && imageAlpha.get().tex)
        {
            shader.define("HAS_TEXTUREALPHA");
            oldHadImageAlpha = true;
        }
        else
        {
            shader.removeDefine("HAS_TEXTUREALPHA");
            oldHadImageAlpha = false;
        }
    }

    if (image.get() && image.get().tex && amount.get() > 0.0)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

        if (image.get() && image.get().tex) cgl.setTexture(1, image.get().tex);
        else cgl.setTexture(1, null);

        if (imageAlpha.get() && imageAlpha.get().tex) cgl.setTexture(2, imageAlpha.get().tex);
        else cgl.setTexture(2, null);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
}
