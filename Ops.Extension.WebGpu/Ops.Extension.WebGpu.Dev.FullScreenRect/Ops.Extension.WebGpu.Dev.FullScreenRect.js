const
    render = op.inTrigger("render"),
    inScale = op.inSwitch("Scale", ["Stretch", "Fit"], "Fit"),
    flipY = op.inValueBool("Flip Y"),
    flipX = op.inValueBool("Flip X"),
    inTexture = op.inTexture("Texture"),
    trigger = op.outTrigger("trigger");

new CABLES.WebGpuOp(op);

let cgp = null;
let mesh = null;
let geom = new CGL.Geometry("fullscreen rectangle");
let x = 0, y = 0, w = 0, h = 0;

op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);
op.toWorkPortsNeedToBeLinked(render);

flipX.onChange =
    flipY.onChange = rebuildFlip;
render.onTriggered = doRender;
inTexture.onLinkChanged = () =>
{
    updateUi();
    updateShaderLater = true;
};

inScale.onChange = updateScale;

let shader = null;
let useShader = false;
let updateShaderLater = true;
let fitImageAspect = false;

updateUi();
updateScale();

inTexture.onChange = function ()
{
    updateShaderLater = true;
};

function updateUi()
{
    if (!CABLES.UI) return;
    flipY.setUiAttribs({ "greyout": !inTexture.isLinked() });
    flipX.setUiAttribs({ "greyout": !inTexture.isLinked() });
    inScale.setUiAttribs({ "greyout": !inTexture.isLinked() });
}

function updateShader()
{
    // let tex = inTexture.get();
    if (inTexture.isLinked()) useShader = true;
    else useShader = false;
    updateShaderLater = false;
}

op.preRender = function ()
{
    updateShader();
    shader.bind();
    if (mesh)mesh.render(shader);
    doRender();
};

function updateScale()
{
    fitImageAspect = inScale.get() == "Fit";
}

function doRender()
{
    cgp = op.patch.cg;

    cgp.viewPort[2] = 3;
    cgp.viewPort[3] = 3;

    if (!cgp)
    {
        return console.log("no cgp");
    }

    if (!shader)
    {
        shader = new CGP.Shader(cgp, "fullscreenrectangle", this);
        shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

        shader.setSource(attachments.fsrect_wgsl);

        shader.aspectUni = new CGP.Uniform(shader, "f", "aspectTex", 1);

        const binTex = new CGP.Binding(cgp, "tex", { "shader": shader, "stage": "frag" });
        const uniTex = new CGP.Uniform(shader, "t", "ourTexture", inTexture);
        binTex.addUniform(uniTex);

        const binSampler = new CGP.Binding(cgp, "sampler", { "stage": "frag", "shader": shader });
        binSampler.addUniform(new CGP.Uniform(shader, "sampler", "ourSampler", inTexture));
    }

    if (cgp.viewPort[2] != w || cgp.viewPort[3] != h || !mesh) rebuild();

    if (updateShaderLater) updateShader();

    cgp.pushPMatrix();
    mat4.identity(cgp.pMatrix);
    mat4.ortho(cgp.pMatrix, 0, cgp.viewPort[2], cgp.viewPort[3], 0, -1000, 1000);

    cgp.pushModelMatrix();
    mat4.identity(cgp.mMatrix);

    cgp.pushViewMatrix();

    if (fitImageAspect && inTexture.get())
    {
        const rat = inTexture.get().width / inTexture.get().height;

        let _h = h;
        let _w = h * rat;

        if (_w > w)
        {
            _h = w * 1 / rat;
            _w = w;
        }

        // cgp.pushViewPort((w - _w) / 2, (h - _h) / 2, _w, _h);
    }

    if (useShader)
    {
        // if (inTexture.get()) cgp.setTexture(0, inTexture.get().tex);???????????????????????????????/**/
        // console.log(shader)
        // console.log("xx",cgp.getShader())
        if (mesh)
        {
            mesh.render(shader);
        }
    }
    else
    {
        if (mesh)mesh.render(cgp.getShader());
    }

    // cgp.gl.clear(cgp.gl.DEPTH_BUFFER_BIT);

    if (!mesh)console.log("no");

    cgp.popPMatrix();
    cgp.popModelMatrix();
    cgp.popViewMatrix();

    if (fitImageAspect && inTexture.get()) cgp.popViewPort();

    trigger.trigger();
}

function rebuildFlip()
{
    mesh = null;
}

function rebuild()
{
    if (!cgp)
        return console.log("no cgp2");

    if (cgp.viewPort[2] == w && cgp.viewPort[3] == h && mesh) return console.log("same same");

    let xx = 0, xy = 0;

    w = cgp.viewPort[2];
    h = cgp.viewPort[3];

    console.log("w,h", w, h);

    geom.vertices = new Float32Array([
        xx + w, xy + h, 0.0,
        xx, xy + h, 0.0,
        xx + w, xy, 0.0,
        xx, xy, 0.0
    ]);

    console.log(geom);

    let tc = null;

    if (flipY.get())
        tc = new Float32Array([
            1.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]);
    else
        tc = new Float32Array([
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ]);

    if (flipX.get())
    {
        tc[0] = 0.0;
        tc[2] = 1.0;
        tc[4] = 0.0;
        tc[6] = 1.0;
    }

    geom.setTexCoords(tc);

    geom.verticesIndices = new Uint16Array([
        2, 1, 0,
        3, 1, 2
    ]);

    geom.vertexNormals = new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ]);
    geom.tangents = new Float32Array([
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0]);
    geom.biTangents == new Float32Array([
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0]);

    if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });// mesh = new CGP.Mesh(cgp, geom);
    else mesh.setGeom(geom);
}
