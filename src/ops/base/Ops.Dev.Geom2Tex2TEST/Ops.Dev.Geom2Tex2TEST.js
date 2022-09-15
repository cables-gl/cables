const
    exec = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inSize = op.inSwitch("Size", ["Auto", "Manual"], "Auto"),
    inWidth = op.inValueInt("Tex Width", 256),

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

let autoSize = true;
let needsUpdate = true;
let shader = null;
let size = 0;
const showingError = false;
const tex = null;
let fb = null;
let needInit = true;
let mesh = null;
let vertNums = new Float32Array(1);

tfilter.onChange =
    twrap.onChange = initFbLater;

inWidth.onChange =
inSize.onChange = updateSize;

updateUI();

const drawBuffArr = [true, true];

const vertModTitle = "vert_" + op.name;
const mod = new CGL.ShaderModifier(cgl, op.name);
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

mod.addUniformVert("f", "MOD_texSize", 0);

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
    updateSize();
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
    needInit = true;
    needsUpdate = true;
    warning();
    updateUI();
}

function updateSize()
{
    size = inWidth.get();

    autoSize = inSize.get() == "Auto";

    const geo = inGeom.get();

    if(autoSize&& !geo)
    {
        size=-1;
        return;
    }
    if (autoSize && geo)
    {
        size = Math.ceil(Math.sqrt(geo.vertices.length / 3));
    }

    size=Math.ceil(Math.max(1, size));


    updateUI();
    needsUpdate=true;
    op.log("size", size);
}

function initFb()
{
    needInit = false;
    if (fb) fb = fb.delete();
    outTex.set(CGL.Texture.getEmptyTexture(cgl));
    if(size<1) return;

    let filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;

    let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;

    if (cgl.glVersion >= 2)
    {
        console.log("new fb....",size);

        fb = new CGL.Framebuffer2(cgl, size, size,
            {
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
        fb = new CGL.Framebuffer(cgl, size, size,
            {
                "isFloatingPointTexture": true,
                "filter": filter,
                "wrap": selectedWrap
            });
    }
    // outTex.set(fb.getTextureColor());

}

exec.onTriggered = function ()
{
    if (!fb || needInit)initFb();
    if(size ==-1 || (fb && fb.getWidth()!=size))updateSize();

    if (!needsUpdate) return next.trigger();
    if (outTex.get() != CGL.Texture.getEmptyTexture(cgl))outTex.set(CGL.Texture.getEmptyTexture(cgl));

    const geo = inGeom.get();
    if (!geo)
    {
        next.trigger();
        return;
    }

    mod.setUniformValue("MOD_texSize", size);
    if(size<1)
    {
        needsUpdate=true;
        return;
    }

    if(fb && fb.getWidth()!=size)
    {
        console.log("fb setsize...");
        fb.setSize(size,size);
    }

    if (geo && geo.copy)
    {
        const g = geo.copy();

        if(!mesh)mesh = new CGL.Mesh(cgl, g, cgl.gl.POINTS);

        mesh.setGeom(g);
        mesh.addVertexNumbers = true;

        let numVerts = g.vertices.length / 3;

        if(vertNums.length!=numVerts)
        {
            vertNums = new Float32Array(numVerts);
            for (let i = 0; i < numVerts; i++) vertNums[i] = i;
        }

        if (inRandomize.get())
        {
            shuffleArray(vertNums);
        }

        mesh._setVertexNumbers(vertNums);

        outNumVerts.set(numVerts);
    }

    render();

    op.log("?yep calced");

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

    if(!fb)
    {
        needsUpdate=true;
        return;
    }

    fb.renderStart(cgl);

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.gl.viewport(0, 0, size, size);

    mat4.ortho(
        cgl.pMatrix,
        0, size,
        0, size,
        -1.00, 100);

    mod.bind();


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

    mod.unbind();
}

