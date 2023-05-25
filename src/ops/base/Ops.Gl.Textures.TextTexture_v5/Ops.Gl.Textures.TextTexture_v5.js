const
    render = op.inTriggerButton("Render"),

    drawMesh = op.inValueBool("Draw Mesh", true),
    meshScale = op.inValueFloat("Scale Mesh", 1.0),

    text = op.inString("text", "cables"),
    font = op.inString("font", "Arial"),
    weight = op.inString("weight", "normal"),
    maximize = op.inValueBool("Maximize Size", true),
    inFontSize = op.inValueFloat("fontSize", 300),
    lineDistance = op.inValueFloat("Line Height", 1),
    lineOffset = op.inValueFloat("Vertical Offset", 0),
    lineOffsetHor = op.inValueFloat("Horizontal Offset", 0),
    drawDebug = op.inBool("Show Debug", false),
    inSize = op.inSwitch("Size", ["Auto", "Canvas", "Manual"], "Auto"),

    texWidth = op.inValueInt("texture width", 512),
    texHeight = op.inValueInt("texture height", 128),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], 0),
    align = op.inSwitch("align", ["left", "center", "right"], "center"),
    valign = op.inSwitch("vertical align", ["top", "center", "bottom"], "center"),
    cachetexture = op.inValueBool("Reuse Texture", true),

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
op.setPortGroup("Size", [font, , weight, maximize, inFontSize, lineDistance, lineOffset, lineOffsetHor]);
op.setPortGroup("Texture", [inSize, wrap, texWidth, texHeight, tfilter, aniso]);
op.setPortGroup("Alignment", [valign, align]);
op.setPortGroup("Rendering", [drawMesh, meshScale]);

render.onLinkChanged = () =>
{
    if (!render.isLinked())textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));
    else textureOut.setRef(tex);
};

align.onChange =
    valign.onChange =
    text.onChange =
    inFontSize.onChange =
    weight.onChange =
    aniso.onChange =
    font.onChange =
    lineOffset.onChange =
    lineOffsetHor.onChange =
    lineDistance.onChange =
    cachetexture.onChange =
    texWidth.onChange =
    texHeight.onChange =
    maximize.onChange = function () { needsRefresh = true; };

textureOut.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
let tex = new CGL.Texture(cgl);
let autoHeight = 0;
let autoWidth = 0;

const fontImage = document.createElement("canvas");
fontImage.id = "texturetext_" + CABLES.generateUUID();
fontImage.style.display = "none";
document.body.appendChild(fontImage);

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

render.onTriggered = doRender;
inSize.onChange = () =>
{
    needsRefresh = true;
    updateUi();
};

drawMesh.onChange = updateUi;

op.on("delete", () =>
{
    ctx = null;
    console.log("delete...");
    fontImage.remove();
});

updateUi();

function componentToHex(c)
{
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b)
{
    return "#" + componentToHex(Math.floor(r * 255)) + componentToHex(Math.floor(g * 255)) + componentToHex(Math.floor(b * 255));
}

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

aniso.onChange = tfilter.onChange = () =>
{
    tex = null;
    needsRefresh = true;
};

if (op.patch.isEditorMode()) CABLES.UI.SIMPLEWIREFRAMERECT = CABLES.UI.SIMPLEWIREFRAMERECT || new CGL.WireframeRect(cgl);

if (cgl.glVersion < 2)
{
    cgl.gl.getExtension("OES_standard_derivatives");
    shader.enableExtension("GL_OES_standard_derivatives");
}

function getWidth()
{
    if (inSize.get() == "Auto") return autoWidth;
    if (inSize.get() == "Canvas") return cgl.getViewPort()[2];
    return Math.ceil(texWidth.get());
}

function getHeight()
{
    if (inSize.get() == "Auto") return autoHeight;
    if (inSize.get() == "Canvas") return cgl.getViewPort()[3];
    else return Math.ceil(texHeight.get());
}

function doRender()
{
    if (ctx.canvas.width != getWidth()) needsRefresh = true;
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
    if (!tex) return;
    tex.setSize(getWidth(), getHeight());

    ctx.canvas.width = fontImage.width = getWidth();
    ctx.canvas.height = fontImage.height = getHeight();

    outAspect.set(fontImage.width / fontImage.height);

    needsRefresh = true;
}

function updateUi()
{
    texWidth.setUiAttribs({ "greyout": inSize.get() != "Manual" });
    texHeight.setUiAttribs({ "greyout": inSize.get() != "Manual" });
    maximize.setUiAttribs({ "greyout": inSize.get() == "Auto" });
    inFontSize.setUiAttribs({ "greyout": maximize.get() && inSize.get() != "Auto" });

    meshScale.setUiAttribs({ "greyout": !drawMesh.get() });
}

maximize.onChange = function ()
{
    updateUi();

    needsRefresh = true;
};

function getLineHeight(fontSize)
{
    return lineDistance.get() * fontSize;
}

function removeEmptyLines(lines)
{
    if (lines[lines.length - 1] === "" || lines[lines.length - 1] === "\n")
    {
        lines.length--;
        lines = removeEmptyLines(lines);
    }
    return lines;
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

    ctx.textAlign = align.get();

    let txt = (text.get() + "").replace(/<br\/>/g, "\n");
    let strings = txt.split("\n");

    needsRefresh = false;

    strings = removeEmptyLines(strings);

    let descent = 0;

    if (inSize.get() == "Auto")
    {
        autoWidth = 0;
        autoHeight = 0;

        for (let i = 0; i < strings.length; i++)
        {
            const measure = ctx.measureText(strings[i]);
            autoWidth = Math.max(autoWidth, measure.width) + lineOffsetHor.get();
            // autoHeight += measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent;
            // descent = measure.fontBoundingBoxDescent;

            autoHeight += (measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent) * 1.2;
            descent = measure.actualBoundingBoxDescent * 1.2;

            console.log(measure);
        }

        autoHeight = Math.ceil(autoHeight * lineDistance.get());
        autoWidth = Math.ceil(autoWidth);

        if (autoWidth > cgl.maxTexSize || autoHeight > cgl.maxTexSize) op.setUiError("textoobig", "Texture too big!");
        else op.setUiError("textoobig", null);

        autoHeight = Math.min(cgl.maxTexSize, autoHeight);
        autoWidth = Math.min(cgl.maxTexSize, autoWidth);

        if (ctx.canvas.width != autoWidth || ctx.canvas.height != autoHeight) reSize();
    }

    if (maximize.get() && inSize.get() != "Auto")
    {
        fontSize = getWidth();
        let count = 0;
        let maxWidth = 0;
        let maxHeight = 0;

        do
        {
            count++;
            if (count > (getHeight() + getWidth()) / 2)
            {
                op.log("too many iterations - maximize size");
                break;
            }
            fontSize -= 5;
            ctx.font = weight.get() + " " + fontSize + "px \"" + font.get() + "\"";
            maxWidth = 0;

            maxHeight = (fontSize + (strings.length - 1) * getLineHeight(fontSize)) * 1.2;
            for (let i = 0; i < strings.length; i++) maxWidth = Math.max(maxWidth, ctx.measureText(strings[i]).width);
        }
        while (maxWidth > ctx.canvas.width || maxHeight > ctx.canvas.height);
    }
    else
    {
        let found = true;

        if (getWidth() > 128)
        {
            found = false;
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
                    let append = " ";
                    if (j == words.length - 1)append = "";
                    sumWidth += ctx.measureText(words[j] + append).width;

                    if (sumWidth > getWidth() && inSize.get() != "Auto")
                    {
                        found = true;
                        newString += "\n" + words[j] + append;
                        sumWidth = ctx.measureText(words[j] + append).width;
                    }
                    else
                    {
                        newString += words[j] + append;
                    }
                }
                newString += "\n";
            }
            txt = newString;
            strings = txt.split("\n");
        }
        strings = removeEmptyLines(strings);
    }

    strings = removeEmptyLines(strings);
    const firstLineHeight = fontSize;
    const textHeight = firstLineHeight + (strings.length - 1) * getLineHeight(fontSize);

    let posy = (lineOffset.get() * fontSize) - descent;

    if (valign.get() == "top") posy += firstLineHeight;
    else if (valign.get() == "center") posy += (ctx.canvas.height / 2) - (textHeight / 2) + firstLineHeight;
    else if (valign.get() == "bottom") posy += ctx.canvas.height - textHeight + firstLineHeight;

    let miny = 999999;
    let maxy = -999999;

    const dbg = drawDebug.get();

    for (let i = 0; i < strings.length; i++)
    {
        let posx = lineOffsetHor.get();
        if (align.get() == "center") posx = ctx.canvas.width / 2;
        if (align.get() == "right") posx = ctx.canvas.width;

        ctx.fillText(strings[i], posx, posy);

        miny = Math.min(miny, posy - firstLineHeight);
        maxy = Math.max(maxy, posy);

        if (dbg)
        {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#FF0000";
            ctx.beginPath();
            ctx.moveTo(0, posy);
            ctx.lineTo(21000, posy);
            ctx.stroke();
        }

        posy += getLineHeight(fontSize);
    }

    if (dbg)
    {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#FF0000";
        ctx.strokeRect(0, miny, ctx.canvas.width - 3, maxy - miny);
    }

    ctx.restore();

    outRatio.set(ctx.canvas.height / ctx.canvas.width);
    outLines.set(strings.length);

    let cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

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
    textureOut.setRef(tex);
    tex.unpackAlpha = false;
}
