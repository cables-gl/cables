const
    exec = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inWidth = op.inValueInt("Tex Size", 256),

    tfilter = op.inValueSelect("filter", ["nearest", "linear"], "nearest"),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    inRandomize = op.inBool("Randomize", false),
    next = op.outTrigger("Next"),
    outNumVerts = op.outNumber("Total Vertices"),
    outTex = op.outTexture("Texture");

op.setPortGroup("Texture settings", [tfilter, twrap]);

let numTextures = 1;
const cgl = op.patch.cgl;
const prevViewPort = [0, 0, 0, 0];
const effect = null;

let needsUpdate = true;
let shader = null;
const showingError = false;
const tex = null;
let fb = null;
let needInit = true;
let mesh = null;

inWidth.onChange =
    tfilter.onChange =
    twrap.onChange = initFbLater;

updateUI();

const drawBuffArr = [true, true];

const vertModTitle = "vert_" + op.name;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 200,
    "title": vertModTitle,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "OUT vec3 MOD_pos;",
    "srcBodyVert": attachments.vertpos_vert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": "IN vec3 MOD_pos;",
    "srcBodyFrag": attachments.fragpos_frag
});

mod.addUniformVert("f", "MOD_texSize", inWidth);

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

inRandomize.onChange =
inGeom.onChange = function ()
{
    const geo = inGeom.get();
    needsUpdate = true;

    if (mesh)mesh.dispose();
    if (geo && geo.copy)
    {
        const g = geo.copy();

        mesh = new CGL.Mesh(cgl, g, cgl.gl.POINTS);
        mesh.addVertexNumbers = true;

        let numVerts = g.vertices.length / 3;

        if (inRandomize.get())
        {
            let vertNums = new Float32Array(numVerts);
            for (let i = 0; i < numVerts; i++) vertNums[i] = i;
            shuffleArray(vertNums);

            mesh._setVertexNumbers(vertNums);
        }
        else mesh._setVertexNumbers();

        outNumVerts.set(numVerts);
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

function initFb()
{
    needInit = false;
    if (fb)fb.delete();

    fb = null;

    let w = Math.max(1, inWidth.get());
    let h = Math.max(1, inWidth.get());

    let filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;

    let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;

    if (cgl.glVersion >= 2)
    {
        fb = new CGL.Framebuffer2(cgl, w, h, {
            "isFloatingPointTexture": true,
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
        fb = new CGL.Framebuffer(cgl, inWidth.get(), inWidth.get(), {
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

    if (inGeom.get())
    {
        let needsUpdate = true;

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
            -1.00,
            100);

        mod.bind();

        if (!cgl.getShader())
        {
            op.setUiError("not in mainloop", "Needs to be connected to mainloop branch");
            return;
        }
        else op.setUiError("not in mainloop", null);

        if (mesh)
        {
            cgl.getShader().setDrawBuffers(drawBuffArr);
            mesh.render(cgl.getShader());
        }

        cgl.popPMatrix();
        cgl.popModelMatrix();
        cgl.popViewMatrix();
        fb.renderEnd(cgl);

        outTex.set(fb.getTextureColor());

        cgl.gl.viewport(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

        next.trigger();
        mod.unbind();
    }
    else
    {
        outTex.set(CGL.Texture.getEmptyTexture(cgl));
        next.trigger();
    }
};
