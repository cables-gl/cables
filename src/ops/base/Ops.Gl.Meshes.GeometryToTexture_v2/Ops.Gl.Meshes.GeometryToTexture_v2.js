const
    exec = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inUpdateAlways = op.inBool("Continously Update", true),

    inOrder = op.inDropDown("Order", ["Sequential", "Random", "Vertex X", "Vertex Y", "Vertex Z"], "Sequential"),
    inAttrib = op.inDropDown("Content", ["Vertex Pos", "Normals", "Vertex Colors", "TexCoords", "Texture Color"], "Vertex Pos"),

    inResize = op.inSwitch("Resize", ["None", "Rescale"]),
    inResizeNewSize = op.inFloat("New Size", 1),

    inSize = op.inSwitch("Size", ["Auto", "Manual"], "Auto"),
    inWidth = op.inValueInt("Tex Width", 256),
    tfilter = op.inValueSelect("filter", ["nearest", "linear"], "nearest"),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA32F),
    inTexColor = op.inTexture("Color Texture", null, "Texture"),
    next = op.outTrigger("Next"),
    outNumVerts = op.outNumber("Total Vertices"),
    outTex = op.outTexture("Texture");

op.setPortGroup("Texture settings", [tfilter, twrap, inWidth, inPixelFormat, inSize]);
op.toWorkPortsNeedToBeLinked(inGeom, exec);

const cgl = op.patch.cgl;
const prevViewPort = [0, 0, 0, 0];
const effect = null;

let autoSize = true;
let needsUpdate = true;
let needsUpdateSize = true;
let shader = null;
let size = 0;
let fb = null;
let needInitFb = true;
let mesh = null;
let vertNums = new Float32Array(1);
let numVerts = 1;
let gotBounds = false;

inPixelFormat.onChange =
tfilter.onChange =
    twrap.onChange = initFbLater;

inWidth.onChange =
    inSize.onChange = updateSize;

inAttrib.onChange = updateAttrib;

updateUI();

const vertModTitle = "vert_" + op.name;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 200,
    "title": vertModTitle,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.vertpos_head_vert,
    "srcBodyVert": attachments.vertpos_vert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": "IN vec3 MOD_pos;",
    "srcBodyFrag": attachments.fragpos_frag
});
mod.addUniformVert("f", "MOD_mul", 1);
mod.addUniformVert("f", "MOD_texSize", 0);
mod.addUniformVert("t", "MOD_texColor", 0);
updateAttrib();

function shuffleArray(array)
{
    let i = 0;
    let j = 0;
    let temp = null;

    for (i = array.length - 1; i > 0; i -= 1)
    {
        j = Math.floor(Math.seededRandom() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

inResize.onChange =
inResizeNewSize.onChange =
inTexColor.onChange =
inGeom.onChange = function ()
{
    needsUpdateSize = true;
    needsUpdate = true;
    gotBounds = false;
};

function updateRescale()
{
    inResizeNewSize.setUiAttribs({ "greyout": inResize.get() != "Rescale" });

    if (inResize.get() == "Rescale")
    {
        const g = inGeom.get();
        if (!g) return;
        const b = g.getBounds();

        mod.setUniformValue("MOD_mul", inResizeNewSize.get() / b._maxAxis);
        gotBounds = true;
    }
    else
        mod.setUniformValue("MOD_mul", 1);
}

function updateAttrib()
{
    op.setUiAttrib({ "extendTitle": inAttrib.get() });

    mod.toggleDefine("MOD_ATTRIB_POS", inAttrib.get() == "Vertex Pos");
    mod.toggleDefine("MOD_ATTRIB_TC", inAttrib.get() == "TexCoords");
    mod.toggleDefine("MOD_ATTRIB_NORMAL", inAttrib.get() == "Normals");
    mod.toggleDefine("MOD_ATTRIB_TEXTURECOLOR", inAttrib.get() == "Texture Color");
    mod.toggleDefine("MOD_ATTRIB_VERTCOLS", inAttrib.get() == "Vertex Colors");

    needsUpdate = true;
}

inOrder.onChange = () =>
{
    needsUpdate = true;
};

function warning()
{
}

function updateUI()
{
    inWidth.setUiAttribs({ "greyout": inSize.get() == "Auto" });
}

function initFbLater()
{
    needInitFb = true;
    needsUpdate = true;
    warning();
    updateUI();
}

function updateSize()
{
    const oldSize = size;
    size = inWidth.get();

    autoSize = inSize.get() == "Auto";

    const geo = inGeom.get();

    if (autoSize && !geo)
    {
        needsUpdateSize = true;
        size = -1;
        return;
    }
    if (autoSize && geo && geo.vertices)
    {
        size = Math.ceil(Math.sqrt(geo.vertices.length / 3));
    }

    size = Math.ceil(Math.max(1, size));

    updateUI();
    if (oldSize != size) needsUpdate = true;
    needsUpdateSize = false;
}

function initFb()
{
    if (fb) fb = fb.delete();

    if (size < 1) return outTex.set(CGL.Texture.getEmptyTexture(cgl));

    let filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;

    let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;

    if (cgl.glVersion >= 2)
    {
        fb = new CGL.Framebuffer2(cgl, size, size, {
            "name": "geom2tex",
            "pixelFormat": inPixelFormat.get(),
            "multisampling": false,
            "wrap": selectedWrap,
            "filter": filter,
            "depth": true,
            "multisamplingSamples": 0,
            "clear": true
        });
    }
    else
    {
        fb = new CGL.Framebuffer(cgl, size, size, {
            "name": "geom2tex",
            "isFloatingPointTexture": true,
            "filter": filter,
            "wrap": selectedWrap
        });
    }
    needInitFb = false;
}

let oldGeom = null;
let g = null;
exec.onTriggered = function ()
{
    updateSize();

    if (!fb || needInitFb) initFb();
    if (!needsUpdate && !inUpdateAlways.get()) return next.trigger();
    // if (outTex.get() != CGL.Texture.getEmptyTexture(cgl)) outTex.set(CGL.Texture.getEmptyTexture(cgl));

    const geo = inGeom.get();

    if (!geo || !geo.copy || !geo.vertices) return next.trigger();

    if (size < 1)
    {
        needsUpdate = true;
        return;
    }
    // if(inUpdateAlways.get()) needsUpdate = true;

    if (fb && fb.getWidth() != size) fb.setSize(size, size);
    // if (oldGeom != geo)
    // {
    oldGeom = geo;
    g = geo.copy();

    if (!mesh)mesh = new CGL.Mesh(cgl, new CGL.Geometry("geom2tex"), cgl.gl.POINTS);

    g.glPrimitive = cgl.gl.POINTS;
    mesh.setGeom(g);
    // }
    numVerts = g.vertices.length / 3;

    if (vertNums.length != numVerts) vertNums = new Float32Array(numVerts);

    for (let i = 0; i < numVerts; i++) vertNums[i] = i;

    if (inOrder.get() == "Random") shuffleArray(vertNums);
    if (inOrder.get() == "Vertex X") vertNums.sort(function (a, b) { return g.vertices[a * 3 + 0] - g.vertices[b * 3 + 0]; });
    if (inOrder.get() == "Vertex Y") vertNums.sort(function (a, b) { return g.vertices[a * 3 + 1] - g.vertices[b * 3 + 1]; });
    if (inOrder.get() == "Vertex Z") vertNums.sort(function (a, b) { return g.vertices[a * 3 + 2] - g.vertices[b * 3 + 2]; });

    mesh._setVertexNumbers(vertNums);

    outNumVerts.set(numVerts);

    const effect = cgl.currentTextureEffect;
    if (effect)effect.endEffect();

    if (inTexColor.get())mod.pushTexture("MOD_texColor", inTexColor.get().tex);

    render();

    if (effect)effect.continueEffect();

    needsUpdate = false;
    next.trigger();
};

function render()
{
    if (!cgl.getShader())
    {
        op.setUiError("not in mainloop", "Needs to be connected to mainloop branch");
        return;
    }
    else op.setUiError("not in mainloop", null);

    const vp = cgl.getViewPort();
    prevViewPort[0] = vp[0];
    prevViewPort[1] = vp[1];
    prevViewPort[2] = vp[2];
    prevViewPort[3] = vp[3];

    fb.renderStart(cgl);

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.setViewPort(0, 0, size, size);

    mat4.ortho(
        cgl.pMatrix,
        0,
        size,
        0,
        size,
        -1.00,
        100);

    mod.bind();
    if (!gotBounds) updateRescale();

    mod.setUniformValue("MOD_texSize", size);
    mesh.render(cgl.getShader());

    mod.unbind();

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
    fb.renderEnd(cgl);

    outTex.setRef(fb.getTextureColor());

    cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);
}
