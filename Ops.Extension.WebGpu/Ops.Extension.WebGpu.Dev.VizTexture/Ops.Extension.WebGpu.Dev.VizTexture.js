const
    inTex = op.inTexture("Texture In");

op.setUiAttrib({ "height": 150, "resizable": true });

let geom = new CGL.Geometry(op.objName);
let x = 0, y = 0, w = 0, h = 0;
let mesh = null;
let canvaAttachment = null;
let shader = null;
let useShader = false;
let updateShaderLater = true;

op.renderVizLayerGpu = (cgp) =>
{
    if (!canvaAttachment)canvaAttachment = new CGP.WebGpuCanvasAttachment(cgp);

    canvaAttachment.render(() =>
    {
        if (inTex.get())
        {
            if (!mesh)rebuildMesh(cgp);
            renderFsRectMesh(cgp);
        }
    });
};

op.renderVizLayer = (ctx, layer) =>
{
    if (canvaAttachment && canvaAttachment.canvas)
        ctx.drawImage(canvaAttachment.canvas,
            0, 0,
            canvaAttachment.canvas.width,
            canvaAttachment.canvas.height,
            layer.x,
            layer.y,
            layer.width,
            layer.width * (canvaAttachment.canvas.height / canvaAttachment.canvas.width));

    else
    {
        ctx.fillStyle = "#ff0";
        ctx.fillRect(layer.x, layer.y, layer.width, layer.width);
    }
};

function updateShader()
{
    if (inTex.isLinked()) useShader = true;
    else useShader = false;
    updateShaderLater = false;
}

function renderFsRectMesh(cgp)
{
    if (!cgp) return console.log("no cgp");

    if (!shader)
    {
        shader = new CGP.Shader(cgp, op.objName, this);
        shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

        shader.setSource(attachments.vizrect_wgsl);

        shader.aspectUni = new CGP.Uniform(shader, "f", "aspectTex", 1);

        const binTex = new CGP.Binding(cgp, "tex", { "shader": shader, "stage": "frag" });
        const uniTex = new CGP.Uniform(shader, "t", "ourTexture", inTex);
        binTex.addUniform(uniTex);

        const binSampler = new CGP.Binding(cgp, "sampler", { "stage": "frag", "shader": shader });
        binSampler.addUniform(new CGP.Uniform(shader, "sampler", "ourSampler", inTex));
    }

    if (cgp.viewPort[2] != w || cgp.viewPort[3] != h || !mesh) rebuild();

    if (updateShaderLater) updateShader();

    cgp.pushPMatrix();
    mat4.identity(cgp.pMatrix);
    mat4.ortho(cgp.pMatrix, 0, cgp.viewPort[2], cgp.viewPort[3], 0, -1000, 1000);

    cgp.pushModelMatrix();
    mat4.identity(cgp.mMatrix);

    cgp.pushViewMatrix();

    let fitImageAspect = true;
    if (fitImageAspect && inTex.get())
    {
        const rat = inTex.get().width / inTex.get().height;

        let _h = h;
        let _w = h * rat;

        if (_w > w)
        {
            _h = w * 1 / rat;
            _w = w;
        }
    }

    if (useShader)
    {
        if (mesh)
        {
            mesh.render(shader);
        }
    }
    else
    {
        if (mesh)mesh.render(cgp.getShader());
    }

    if (!mesh)console.log("no");

    cgp.popPMatrix();
    cgp.popModelMatrix();
    cgp.popViewMatrix();

    if (fitImageAspect && inTex.get()) cgp.popViewPort();
}

function rebuildMesh(cgp)
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
    let flipY = false;
    let flipX = false;

    if (flipY)
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

    if (flipX)
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
