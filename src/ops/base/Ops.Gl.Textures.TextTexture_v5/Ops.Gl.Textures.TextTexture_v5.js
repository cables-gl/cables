const
    render = op.inTriggerButton("Render"),

    drawMesh = op.inValueBool("Draw Mesh", true),
    meshScale = op.inValueFloat("Scale Mesh", 0.5),

    texSizeMeth = op.inSwitch("Size", ["Auto", "Manual"], "Auto"),

    texSizeManWidth = op.inInt("Width", 512),
    texSizeManHeight = op.inInt("Height", 512),
    texSizeAutoHeight = op.inBool("Auto Height", true),

    text = op.inString("text", "cables"),

    texSizeManBreak = op.inBool("Auto Line Breaks", true),

    font = op.inString("font", "Arial"),
    weight = op.inString("weight", "normal"),
    inFontSize = op.inValueFloat("fontSize", 300),
    align = op.inSwitch("align", ["left", "center", "right"], "center"),
    valign = op.inSwitch("Vertical align", ["Top", "Middle", "Bottom"], "Top"),

    inLetterspacing = op.inFloat("Letter Spacing", 0),
    inLineHeight = op.inFloat("Line Height Add", 0),

    inPaddingY = op.inInt("Padding Y Top", 3),
    inPaddingYBot = op.inInt("Padding Y Bottom", 3),
    inPaddingX = op.inInt("Padding X", 0),

    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], 0),
    cachetexture = op.inValueBool("Reuse Texture", true),
    drawDebug = op.inBool("Show Debug", false),

    reloadOnFont = op.inBool("Redraw On Font Load", true),

    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    inOpacity = op.inFloatSlider("Opacity", 1),

    bgR = op.inValueSlider("background R", 0),
    bgG = op.inValueSlider("background G", 0),
    bgB = op.inValueSlider("background B", 0),
    bgA = op.inValueSlider("background A", 1),

    next = op.outTrigger("Next"),
    outRatio = op.outNumber("Ratio"),
    textureOut = op.outTexture("texture"),
    outAspect = op.outNumber("Aspect", 1),
    outLines = op.outNumber("Num Lines");

r.setUiAttribs({ "colorPick": true });
bgR.setUiAttribs({ "colorPick": true });

op.toWorkPortsNeedToBeLinked(render);

op.setPortGroup("Text Color", [r, g, b, inOpacity]);
op.setPortGroup("Background", [bgR, bgG, bgB, bgA]);
op.setPortGroup("Font", [font, weight, inFontSize, align, valign, inLetterspacing, inLineHeight]);
op.setPortGroup("Texture", [wrap, tfilter, aniso, cachetexture, drawDebug]);

op.setPortGroup("Rendering", [drawMesh, meshScale]);

render.onLinkChanged = () =>
{
    if (!render.isLinked())textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));
    else textureOut.setRef(tex);
};

valign.onChange =
    texSizeManBreak.onChange =
    texSizeAutoHeight.onChange =
    inLineHeight.onChange =
    texSizeMeth.onChange =
    texSizeManWidth.onChange =
    texSizeManHeight.onChange =
    align.onChange =
    inLetterspacing.onChange =
    inPaddingY.onChange =
    inPaddingYBot.onChange =
    inPaddingX.onChange =
    text.onChange =
    inFontSize.onChange =
    weight.onChange =
    aniso.onChange =
    font.onChange =
    drawDebug.onChange =
    cachetexture.onChange = function ()
    {
        needsRefresh = true;
        updateUi();
    };

textureOut.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
let tex = new CGL.Texture(cgl);
let autoHeight = 2;
let autoWidth = 2;

const fontImage = document.createElement("canvas");
fontImage.id = "texturetext_" + CABLES.generateUUID();
fontImage.style.display = "none";
document.body.appendChild(fontImage);
fontImage.style.letterSpacing = "0px";

let ctx = fontImage.getContext("2d");
let needsRefresh = true;
const mesh = CGL.MESHES.getSimpleRect(cgl, "texttexture rect");
const vScale = vec3.create();
const shader = new CGL.Shader(cgl, "texttexture");
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
shader.setSource(attachments.text_vert, attachments.text_frag);
const texUni = new CGL.Uniform(shader, "t", "tex");
const aspectUni = new CGL.Uniform(shader, "f", "aspect", 0);
const opacityUni = new CGL.Uniform(shader, "f", "a", inOpacity);
const uniColor = new CGL.Uniform(shader, "3f", "color", r, g, b);

if (op.patch.isEditorMode()) CABLES.UI.SIMPLEWIREFRAMERECT = CABLES.UI.SIMPLEWIREFRAMERECT || new CGL.WireframeRect(cgl);

render.onTriggered = doRender;
drawMesh.onChange = updateUi;
updateUi();

op.on("delete", () =>
{
    ctx = null;
    fontImage.remove();
});

aniso.onChange =
    tfilter.onChange =
    wrap.onChange = () =>
    {
        if (tex)tex.delete();
        tex = null;
        needsRefresh = true;
    };

bgR.onChange = bgG.onChange = bgB.onChange = bgA.onChange = r.onChange = g.onChange = b.onChange = inOpacity.onChange = () =>
{
    if (!drawMesh.get() || textureOut.isLinked()) needsRefresh = true;
};

textureOut.onLinkChanged = () =>
{
    if (textureOut.isLinked()) needsRefresh = true;
};

op.patch.on("fontLoaded", (fontName) =>
{
    if (fontName == font.get()) needsRefresh = true;
});

document.fonts.ready.then(() =>
{
    if (reloadOnFont.get())
    {
        needsRefresh = true;
        console.log("reload on font...");
    }
});

document.fonts.onloadingdone = function (fontFaceSetEvent)
{
    if (reloadOnFont.get())
    {
        needsRefresh = true;
        console.log("reload on font...");
    }
};

function getWidth()
{
    return autoWidth;
}

function getHeight()
{
    return autoHeight;
}

function doRender()
{
    if (needsRefresh)
    {
        reSize();
        refresh();
    }

    if (drawMesh.get())
    {
        vScale[0] = vScale[1] = vScale[2] = meshScale.get();
        cgl.pushBlendMode(CGL.BLEND_NORMAL, false);
        cgl.pushModelMatrix();
        mat4.scale(cgl.mMatrix, cgl.mMatrix, vScale);

        shader.popTextures();
        shader.pushTexture(texUni, tex.tex);
        aspectUni.set(outAspect.get());

        if (cgl.shouldDrawHelpers(op))
            CABLES.UI.SIMPLEWIREFRAMERECT.render(outAspect.get(), 1, 1);

        cgl.pushShader(shader);
        mesh.render(shader);

        cgl.popShader();
        cgl.popBlendMode();
        cgl.popModelMatrix();
    }

    next.trigger();
}

function reSize()
{
    if (tex) tex.setSize(getWidth(), getHeight());

    ctx.canvas.width = fontImage.width = getWidth();
    ctx.canvas.height = fontImage.height = getHeight();

    outAspect.set(fontImage.width / fontImage.height);

    needsRefresh = true;
}

function autoLineBreaks(strings)
{
    let newString = "";

    for (let i = 0; i < strings.length; i++)
    {
        if (!strings[i])
        {
            newString += "\n";
            continue;
        }
        let sumWidth = 0;
        const words = strings[i].split(" ");

        for (let j = 0; j < words.length; j++)
        {
            if (!words[j]) continue;
            sumWidth += ctx.measureText(words[j] + " ").width;

            if (sumWidth > texSizeManWidth.get())
            {
                // found = true;
                newString += "\n" + words[j] + " ";
                sumWidth = ctx.measureText(words[j] + " ").width;
            }
            else
            {
                newString += words[j] + " ";
            }
        }
        newString += "\n";
    }
    let txt = newString;
    strings = txt.split("\n");
    if (strings[strings.length - 1] == "")strings.pop();
    // console.log(strings);
    return strings;
}

function refresh()
{
    cgl.checkFrameStarted("texttrexture refresh");
    const rgbStringClear = "rgba(" + Math.floor(bgR.get() * 255) + "," + Math.floor(bgG.get() * 255) + "," + Math.floor(bgB.get() * 255) + "," + bgA.get() + ")";
    ctx.fillStyle = rgbStringClear;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const rgbString = "rgba(" + Math.floor(r.get() * 255) + ","
        + Math.floor(g.get() * 255) + "," + Math.floor(b.get() * 255) + ","
        + inOpacity.get() + ")";

    ctx.fillStyle = rgbString;
    let fontSize = parseFloat(inFontSize.get());
    let fontname = font.get();
    if (fontname.indexOf(" ") > -1) fontname = "\"" + fontname + "\"";
    ctx.font = weight.get() + " " + fontSize + "px " + fontname + "";

    ctx.textBaseline = "top";
    ctx.textAlign = align.get();
    ctx.letterSpacing = inLetterspacing.get() + "px";

    let txt = (text.get() + "").replace(/<br\/>/g, "\n");
    let strings = txt.split("\n");

    needsRefresh = false;

    let oneLineHeight = 0;
    let paddingY = Math.max(0, inPaddingY.get());
    let paddingYBot = inPaddingYBot.get();
    let paddingX = Math.max(0, inPaddingX.get());

    autoWidth = 0;
    autoHeight = 0;

    if (texSizeManBreak.get() && texSizeMeth.get() == "Manual")
    {
        if (texSizeManWidth.get() > 128)
        {
            strings = autoLineBreaks(strings);
        }
    }

    for (let i = 0; i < strings.length; i++)
    {
        const measure = ctx.measureText(strings[i]);
        oneLineHeight = Math.max(oneLineHeight, Math.ceil(Math.abs(measure.actualBoundingBoxAscent) + measure.actualBoundingBoxDescent)) + inLineHeight.get();
    }

    for (let i = 0; i < strings.length; i++)
    {
        const measure = ctx.measureText(strings[i]);
        autoWidth = Math.max(autoWidth, measure.width);
        autoHeight += oneLineHeight;
    }

    autoWidth += paddingX * 2;
    autoHeight += paddingY + paddingYBot;

    let calcHeight = autoHeight;

    if (texSizeMeth.get() == "Manual")
    {
        autoWidth = texSizeManWidth.get() + paddingX * 2;

        if (!texSizeAutoHeight.get())
        {
            autoHeight = texSizeManHeight.get();
            paddingY = 0;
        }
    }

    autoHeight = Math.ceil(autoHeight);
    autoWidth = Math.ceil(autoWidth);

    if (autoWidth > cgl.maxTexSize || autoHeight > cgl.maxTexSize) op.setUiError("textoobig", "Texture too big!");
    else op.setUiError("textoobig", null);

    autoHeight = Math.min(cgl.maxTexSize, autoHeight);
    autoWidth = Math.min(cgl.maxTexSize, autoWidth);

    if (ctx.canvas.width != autoWidth || ctx.canvas.height != autoHeight) reSize();

    let posy = paddingY;
    if (valign.get() == "Middle")posy = (autoHeight - calcHeight) / 2;
    else if (valign.get() == "Bottom")posy = (autoHeight - calcHeight);

    const dbg = drawDebug.get();

    for (let i = 0; i < strings.length; i++)
    {
        let posx = 0 + paddingX;

        if (align.get() == "center") posx = ctx.canvas.width / 2;
        if (align.get() == "right") posx = ctx.canvas.width;

        if (texSizeMeth.get() == "Manual")posx += inLetterspacing.get();

        ctx.fillText(strings[i], posx, posy);

        if (dbg)
        {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#FF0000";
            ctx.beginPath();
            ctx.moveTo(0, posy);
            ctx.lineTo(21000, posy);
            ctx.stroke();
        }

        posy += oneLineHeight;
    }

    ctx.restore();

    let cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    let f = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "nearest") f = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "mipmap") f = CGL.Texture.FILTER_MIPMAP;

    if (!cachetexture.get() || !tex || !textureOut.get() || tex.width != fontImage.width || tex.height != fontImage.height || tex.anisotropic != parseFloat(aniso.get()))
    {
        if (tex)tex.delete();
        tex = new CGL.Texture.createFromImage(cgl, fontImage, { "filter": f, "anisotropic": parseFloat(aniso.get()), "wrap": cgl_wrap });
    }

    tex.flip = false;
    tex.initTexture(fontImage, f);

    outRatio.set(ctx.canvas.height / ctx.canvas.width);
    outLines.set(strings.length);
    textureOut.setRef(tex);
    tex.unpackAlpha = false;
}

function updateUi()
{
    texSizeManWidth.setUiAttribs({ "greyout": texSizeMeth.get() != "Manual" });
    texSizeManHeight.setUiAttribs({ "greyout": texSizeMeth.get() != "Manual" || texSizeAutoHeight.get() });
    texSizeManBreak.setUiAttribs({ "greyout": texSizeMeth.get() != "Manual" });
    valign.setUiAttribs({ "greyout": texSizeMeth.get() != "Manual" });
    texSizeAutoHeight.setUiAttribs({ "greyout": texSizeMeth.get() != "Manual" });

    inPaddingY.setUiAttribs({ "greyout": !texSizeAutoHeight.get() });
    inPaddingYBot.setUiAttribs({ "greyout": !texSizeAutoHeight.get() });
    meshScale.setUiAttribs({ "greyout": !drawMesh.get() });
}
