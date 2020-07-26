const
    render = op.inTriggerButton("Render"),
    text = op.inString("text", "cables"),
    font = op.inString("font", "Arial"),
    maximize = op.inValueBool("Maximize Size", true),
    inFontSize = op.inValueFloat("fontSize", 30),
    lineDistance = op.inValueFloat("line distance", 1),
    limitLines = op.inValueInt("Limit Lines", 0),
    texWidth = op.inValueInt("texture width", 512),
    texHeight = op.inValueInt("texture height", 128),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    aniso = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], 0),

    align = op.inSwitch("align", ["left", "center", "right"], "center"),
    valign = op.inSwitch("vertical align", ["top", "center", "bottom"], "center"),
    border = op.inValueFloat("border", 0),
    cachetexture = op.inValueBool("Reuse Texture", true),

    drawMesh = op.inValueBool("Draw Mesh", true),
    meshScale = op.inValueFloat("Scale Mesh", 1.0),
    renderHard = op.inValueBool("Hard Edges", false),

    inOpacity = op.inFloatSlider("Opacity", 1),

    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),

    next = op.outTrigger("Next"),

    outRatio = op.outValue("Ratio"),
    textureOut = op.outTexture("texture"),
    outAspect = op.outNumber("Aspect", 1);

r.setUiAttribs({ "colorPick": true });


op.setPortGroup("Color", [r, g, b]);
op.setPortGroup("Size", [font, maximize, inFontSize, lineDistance]);
op.setPortGroup("Texture", [texWidth, texHeight, tfilter, aniso]);
op.setPortGroup("Alignment", [valign, align]);
op.setPortGroup("Rendering", [drawMesh, renderHard, meshScale]);

align.onChange =
    valign.onChange =
    text.onChange =
    inFontSize.onChange =
    aniso.onChange =
    font.onChange =
    border.onChange =
    lineDistance.onChange =
    cachetexture.onChange =
    limitLines.onChange =
    texWidth.onChange =
    texHeight.onChange =
    maximize.onChange = function () { needsRefresh = true; };

render.onTriggered = doRender;

aniso.onChange =
tfilter.onChange = () =>
{
    tex = null;
    needsRefresh = true;
};

textureOut.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
const body = document.getElementsByTagName("body")[0];

var tex = new CGL.Texture(cgl);
const fontImage = document.createElement("canvas");
fontImage.id = "texturetext_" + CABLES.generateUUID();
fontImage.style.display = "none";
body.appendChild(fontImage);

const ctx = fontImage.getContext("2d");
var needsRefresh = true;
const mesh = CGL.MESHES.getSimpleRect(cgl, "texttexture rect");
const vScale = vec3.create();


const shader = new CGL.Shader(cgl, "texttexture");
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
shader.setSource(attachments.text_vert, attachments.text_frag);
const texUni = new CGL.Uniform(shader, "t", "tex");
const aspectUni = new CGL.Uniform(shader, "f", "aspect", 0);
const opacityUni = new CGL.Uniform(shader, "f", "a", inOpacity);
const uniColor = new CGL.Uniform(shader, "3f", "color", r, g, b);


if (cgl.glVersion == 1)
{
    cgl.gl.getExtension("OES_standard_derivatives");
    shader.enableExtension("GL_OES_standard_derivatives");
}

renderHard.onChange = function ()
{
    shader.toggleDefine("HARD_EDGE", renderHard.get());
};

function doRender()
{
    if (ctx.canvas.width != texWidth.get())needsRefresh = true;
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
    tex.setSize(texWidth.get(), texHeight.get());

    ctx.canvas.width = fontImage.width = texWidth.get();
    ctx.canvas.height = fontImage.height = texHeight.get();

    outAspect.set(fontImage.width / fontImage.height);


    needsRefresh = true;
}

maximize.onChange = function ()
{
    inFontSize.setUiAttribs({ "greyout": maximize.get() });
    needsRefresh = true;
};

function refresh()
{
    cgl.checkFrameStarted("texttrexture refresh");

    ctx.clearRect(0, 0, fontImage.width, fontImage.height);
    ctx.fillStyle = "white";
    let fontSize = parseFloat(inFontSize.get());
    let fontname = font.get();
    if (fontname.indexOf(" ") > -1)fontname = "\"" + fontname + "\"";
    ctx.font = fontSize + "px " + fontname + "";
    ctx.textAlign = align.get();

    if (border.get() > 0)
    {
        ctx.beginPath();
        ctx.lineWidth = "" + border.get();
        ctx.strokeStyle = "white";
        ctx.rect(0, 0, texWidth.get(), texHeight.get());
        ctx.stroke();
    }

    let i = 0;
    let txt = (text.get() + "").replace(/<br\/>/g, "\n");
    let strings = txt.split("\n");
    let posy = 0;

    needsRefresh = false;

    if (maximize.get())
    {
        fontSize = texWidth.get();
        let count = 0;
        let maxWidth = 0;
        let maxHeight = 0;

        do
        {
            count++;
            if (count > (texHeight.get() + texWidth.get()) / 2)
            {
                op.log("too many iterations - maximize size");
                break;
            }
            fontSize -= 10;
            ctx.font = fontSize + "px \"" + font.get() + "\"";
            maxWidth = 0;
            maxHeight = strings.length * fontSize * 1.1;
            for (i = 0; i < strings.length; i++) maxWidth = Math.max(maxWidth, ctx.measureText(strings[i]).width);
        }
        while (maxWidth > ctx.canvas.width || maxHeight > ctx.canvas.height);
    }
    else
    {
        let found = true;
        const newStrings = [];

        if (texWidth.get() > 128)
        {
            found = false;
            let newString = "";

            for (let i = 0; i < strings.length; i++)
            {
                if (!strings[i]) continue;
                let sumWidth = 0;
                const words = strings[i].split(" ");

                for (let j = 0; j < words.length; j++)
                {
                    if (!words[j]) continue;
                    sumWidth += ctx.measureText(words[j] + " ").width;

                    if (sumWidth > texWidth.get())
                    {
                        found = true;
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
            txt = newString;
            strings = txt.split("\n");
        }
        if (limitLines.get() > 0 && strings.length > limitLines.get())
        {
            strings.length = limitLines.get();
            strings[strings.length - 1] += "...";
        }
    }

    if (valign.get() == "center")
    {
        const maxy = (strings.length - 1.5) * fontSize + parseFloat(lineDistance.get());
        posy = ctx.canvas.height / 2 - maxy / 2;
    }
    else if (valign.get() == "top") posy = fontSize;
    else if (valign.get() == "bottom") posy = ctx.canvas.height - (strings.length) * (parseFloat(inFontSize.get()) + parseFloat(lineDistance.get()));

    for (i = 0; i < strings.length; i++)
    {
        if (align.get() == "center") ctx.fillText(strings[i], ctx.canvas.width / 2, posy);
        if (align.get() == "left") ctx.fillText(strings[i], 0, posy);
        if (align.get() == "right") ctx.fillText(strings[i], ctx.canvas.width, posy);
        posy += fontSize + parseFloat(lineDistance.get());
    }

    ctx.restore();

    outRatio.set(ctx.canvas.height / ctx.canvas.width);

    textureOut.set(CGL.Texture.getEmptyTexture(cgl));

    let f = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "nearest") f = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "mipmap") f = CGL.Texture.FILTER_MIPMAP;

    if (!cachetexture.get() || !tex || !textureOut.get() || tex.width != fontImage.width || tex.height != fontImage.height || tex.anisotropic != parseFloat(aniso.get()))
    {
        tex = new CGL.Texture.createFromImage(cgl, fontImage, { "filter": f, "anisotropic": parseFloat(aniso.get()) });
    }

    tex.flip = false;
    tex.initTexture(fontImage, f);
    textureOut.set(tex);
    tex.unpackAlpha = true;
}
