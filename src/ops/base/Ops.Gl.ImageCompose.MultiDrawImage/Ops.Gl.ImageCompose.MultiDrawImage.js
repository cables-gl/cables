const blendmodes = ["normal", "lighten", "darken", "multiply", "multiply invert", "average", "add", "substract", "difference", "negation", "exclusion", "overlay", "screen", "color dodge", "color burn", "softlight", "hardlight"];
const
    render = op.inTrigger("render"),
    maskInvert = op.inBool("Mask Invert", false),
    trigger = op.outTrigger("trigger");
const
    NUM = 8,
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name),
    amounts = [],
    blends = [],
    alphas = [],
    texMasks = [],
    maskModes = [],
    texs = [];

let needsUpdate = true;

for (let i = 0; i < NUM; i++)
{
    const tex = op.inTexture("Texture " + (i + 1));
    const blend = op.inDropDown("Blendmode " + (i + 1), blendmodes, "normal");
    const texMask = op.inTexture("Mask " + (i + 1));
    const maskMode = op.inSwitch("Mask Source " + (i + 1), ["R", "R inv", "A", "A inv"], "R");
    const alpha = op.inSwitch("Opacity " + (i + 1), ["Normal", "Prev A", "Prev R"], "Normal");
    const amount = op.inValueSlider("Amount " + (i + 1), 1);

    blend.onChange =
    alpha.onChange =
    maskMode.onChange =
    texMask.onLinkChanged =
    tex.onLinkChanged = () => { needsUpdate = true; };

    texs.push(tex);
    texMasks.push(texMask);
    alphas.push(alpha);
    blends.push(blend);
    amounts.push(amount);
    maskModes.push(maskMode);

    op.setPortGroup("Image " + (i + 1), [tex, blend, amount, alpha, texMask, maskMode]);

    new CGL.Uniform(shader, "t", "tex" + (i + 1), i * 2 + 1);
    new CGL.Uniform(shader, "t", "texMask" + (i + 1), i * 2 + 2);
    new CGL.Uniform(shader, "f", "amount" + (i + 1), amount);
}

const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

function setBlendCode()
{
    let defines = "";
    let blendcode = "";
    for (let i = 0; i < NUM; i++)
    {
        let active = texs[i].isLinked();
        amounts[i].setUiAttribs({ "greyout": !active });
        blends[i].setUiAttribs({ "greyout": !active });
        alphas[i].setUiAttribs({ "greyout": !active });

        if (active)
        {
            defines += "#define USE_TEX_" + (i + 1) + "".endl();
            blendcode += getBlendCode(i + 1,
                blends[i].get(),
                alphas[i].get(),
                texMasks[i].get(),
                maskModes[i].get());
        }
    }

    let src = defines.endl() + attachments.invert_frag;
    src = src.replace("{{BLENDCODE}}", blendcode);

    shader.setSource(shader.getDefaultVertexShader(), src);

    needsUpdate = false;
}

function getBlendCode(idx, name, alpha, hasMask, maskMode)
{
    let src = ""
        + "vec3 _blend" + idx + "(vec3 base,vec3 blend)".endl()
        + "{".endl()
        + "   vec3 colNew=blend;".endl();

    if (name == "multiply") src += "       colNew=base*blend;".endl();
    else if (name == "multiply invert") src += "       colNew=base* vec3(1.0)-blend;".endl();
    else if (name == "average") src += "       colNew=((base + blend) / 2.0);".endl();
    else if (name == "add") src += "       colNew=min(base + blend, vec3(1.0));".endl();
    else if (name == "substract") src += "       colNew=max(base + blend - vec3(1.0), vec3(0.0));".endl();
    else if (name == "difference") src += "       colNew=abs(base - blend);".endl();
    else if (name == "negation") src += "       colNew=(vec3(1.0) - abs(vec3(1.0) - base - blend));".endl();
    else if (name == "exclusion") src += "       colNew=(base + blend - 2.0 * base * blend);".endl();
    else if (name == "lighten") src += "       colNew=max(blend, base);".endl();
    else if (name == "darken") src += "       colNew=min(blend, base);".endl();
    else if (name == "overlay")
    {
        src += ""
        + "      #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))".endl()
        + "      colNew=vec3(BlendOverlayf(base.r, blend.r),BlendOverlayf(base.g, blend.g),BlendOverlayf(base.b, blend.b));".endl();
    }
    else if (name == "screen")
    {
        src += ""
        + "      #define BlendScreenf(base, blend)       (1.0 - ((1.0 - base) * (1.0 - blend)))".endl()
        + "      colNew=vec3(BlendScreenf(base.r, blend.r),BlendScreenf(base.g, blend.g),BlendScreenf(base.b, blend.b));".endl();
    }
    else if (name == "softlight")
    {
        src += ""
        + "      #define BlendSoftLightf(base, blend)    ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)))".endl()
        + "      colNew=vec3(BlendSoftLightf(base.r, blend.r),BlendSoftLightf(base.g, blend.g),BlendSoftLightf(base.b, blend.b));".endl();
    }
    else if (name == "hardlight")
    {
        src += ""
        + "      #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))".endl()
        + "      colNew=vec3(BlendOverlayf(base.r, blend.r),BlendOverlayf(base.g, blend.g),BlendOverlayf(base.b, blend.b));".endl();
    }
    else if (name == "color dodge")
    {
        src += ""
        + "      #define BlendColorDodgef(base, blend)   ((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0))".endl()
        + "      colNew=vec3(BlendColorDodgef(base.r, blend.r),BlendColorDodgef(base.g, blend.g),BlendColorDodgef(base.b, blend.b));".endl();
    }
    else if (name == "color burn")
    {
        src += ""
        + "      #define BlendColorBurnf(base, blend)    ((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0))".endl()
        + "      colNew=vec3(BlendColorBurnf(base.r, blend.r),BlendColorBurnf(base.g, blend.g),BlendColorBurnf(base.b, blend.b));".endl();
    }

    src += ""
        + "   return colNew;".endl()
        + "}".endl()

        + "vec4 cgl_blend" + idx + "(vec4 oldColor,vec4 newColor,float amount)".endl()
        + "{".endl()
        // +"vec4 col=vec4(0.0,0.0,0.0,1.0);"

    // +"if(newColor.a==0.0)return vec4(0.0);".endl()
        + "float a=(amount*newColor.a);".endl();

    if (alpha === "Prev A") src += "a*=oldColor.a;";
    if (alpha === "Prev R") src += "a*=oldColor.r;";

    src = src

        + "vec4 col = vec4( _blend" + idx + "(oldColor.rgb, newColor.rgb), 1.0);".endl()
        + "col = vec4( mix( col.rgb,oldColor.rgb, col.a * 1.0-amount), 1.0);".endl();

    if (hasMask)
        if (maskMode === "R")src = src + "newColor.a *= texture(texMask" + idx + ",texCoord).r;".endl();
        else if (maskMode === "R inv")src = src + "newColor.a *= 1.0-texture(texMask" + idx + ",texCoord).r;".endl();
        else if (maskMode === "A")src = src + "newColor.a *= texture(texMask" + idx + ",texCoord).a;".endl();
        else if (maskMode === "A inv")src = src + "newColor.a *= 1.0-texture(texMask" + idx + ",texCoord).a;".endl();

    src = src + "col = vec4( mix( oldColor,col, newColor.a));".endl()

    // + "vec3 blendedCol=_blend"+idx+"(newColor.rgb,newColor.rgb);".endl()
    // + "col.rgb=mix(oldColor.rgb,newColor.rgb,a);".endl()

    // + "col.a=clamp(oldColor.a+a,0.0,1.0);".endl()

            + "return col;".endl()
        + "}".endl().endl();
    return src;
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    if (needsUpdate)setBlendCode();

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    let count = 1;
    for (let i = 0; i < texs.length; i++)
    {
        if (texs[i].get())
        {
            cgl.setTexture(i * 2 + 1, texs[i].get().tex);
            count++;
        }
        if (texMasks[i].get())
        {
            cgl.setTexture(i * 2 + 2, texMasks[i].get().tex);
            count++;
        }
    }
    if (count > cgl.maxTextureUnits) op.setUiError("manytex", "Too many textures bound");
    else op.setUiError("manytex", null);

    cgl.pushBlendMode(CGL.BLEND_NONE, true);
    cgl.currentTextureEffect.finish();
    cgl.popBlendMode();
    cgl.popShader();

    trigger.trigger();
};
