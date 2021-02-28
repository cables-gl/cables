const
    exec = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inWidth = op.inValueInt("Tex Size", 256),

    tfilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"], "nearest"),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    inNumTex = op.inSwitch("Num Textures", ["1", "4"], "1"),
    next = op.outTrigger("Next"),
    outNumVerts = op.outNumber("Total Vertices"),
    outTex = op.outTexture("Texture"),
    outTex2 = op.outTexture("Texture 2"),
    outTex3 = op.outTexture("Texture 3"),
    outTex4 = op.outTexture("Texture 4");

op.setPortGroup("Texture settings", [tfilter, twrap]);

let numTextures = 1;
const cgl = op.patch.cgl;
const prevViewPort = [0, 0, 0, 0];
const effect = null;

let lastShader = null;
let shader = null;

inWidth.onChange =
    tfilter.onChange =
    inNumTex.onChange =
    twrap.onChange = initFbLater;

const showingError = false;

let fb = null;
const tex = null;
let needInit = true;
let mesh = null;

updateUI();

const drawBuffArr = [];

const vertModTitle = "vert_" + op.name;
const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "title": vertModTitle,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "OUT vec3 MOD_pos;",
    "srcBodyVert": attachments.vertpos_vert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": "IN vec3 MOD_pos;",
    "srcBodyFrag": "col.rgb=MOD_pos;col.a=1.0;"
});

mod.addUniformVert("f", "MOD_texSize", inWidth);

inGeom.onChange = function ()
{
    const g = inGeom.get();

    if (mesh)mesh.dispose();
    if (g)
    {
        mesh = new CGL.Mesh(cgl, g, cgl.gl.POINTS);
        mesh.addVertexNumbers = true;
        mesh._setVertexNumbers();
        outNumVerts.set(g.vertices.length / 3);
    }
    else
    {
        mesh = null;
        outNumVerts.set(0);
    }
};

function warning()
{
}

function updateUI()
{
}

function initFbLater()
{
    needInit = true;
    warning();
}

function resetShader()
{
    if (shader) shader.dispose();
    lastShader = null;
    shader = null;
}

function initFb()
{
    needInit = false;
    if (fb)fb.delete();

    const oldLen = drawBuffArr.length;
    numTextures = parseInt(inNumTex.get());
    drawBuffArr.length = 0;
    for (let i = 0; i < numTextures; i++)drawBuffArr[i] = true;

    if (oldLen != drawBuffArr.length)
    {
        resetShader();
    }

    fb = null;

    let w = inWidth.get();
    let h = inWidth.get();

    let filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") filter = CGL.Texture.FILTER_MIPMAP;

    let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;

    if (cgl.glVersion >= 2)
    {
        fb = new CGL.Framebuffer2(cgl, w, h,
            {
                "isFloatingPointTexture": true,
                "multisampling": false,
                "numRenderBuffers": numTextures,
                "wrap": selectedWrap,
                "filter": filter,
                "depth": true,
                "multisamplingSamples": 0,
                "clear": true
            });
    }
    else
    {
        fb = new CGL.Framebuffer(cgl, inWidth.get(), inWidth.get(),
            {
                "isFloatingPointTexture": true,
                "filter": filter,
                "wrap": selectedWrap
            });
    }
}

exec.onTriggered = function ()
{
    const vp = cgl.getViewPort();

    if (!fb || needInit)initFb();

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

    cgl.gl.viewport(0, 0, inWidth.get(), inWidth.get());

    mat4.ortho(
        cgl.pMatrix,
        0,
        inWidth.get(),
        0,
        inWidth.get(),
        -1.001,
        100
    );

    mod.bind();

    if (mesh)mesh.render(cgl.getShader());

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
    fb.renderEnd(cgl);

    if (numTextures >= 2)
    {
        outTex.set(fb.getTextureColorNum(0));
        outTex2.set(fb.getTextureColorNum(1));
        outTex3.set(fb.getTextureColorNum(2));
        outTex4.set(fb.getTextureColorNum(3));
    }
    else outTex.set(fb.getTextureColor());

    cgl.gl.viewport(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    next.trigger();

    mod.unbind();
};
