const
    render = op.inTrigger("render"),
    inScale = op.inSwitch("Scale", ["Fit", "Cover","Stretch"], "Fit"),
    inCropOffset = op.inFloatSlider("Crop Offset", 0, -1, 1),
    flipY = op.inBool("Flip Y"),
    flipX = op.inBool("Flip X"),
    inTexture = op.inTexture("Texture"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
let mesh = null;
let geom = new CGL.Geometry("fullscreen rectangle");
let x = 0, y = 0, w = 0, h = 0;

op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.Port.TYPE_FUNCTION);
op.toWorkPortsNeedToBeLinked(render);

flipX.onChange = rebuildFlip;
flipY.onChange = rebuildFlip;
render.onTriggered = doRender;
inTexture.onLinkChanged = updateUi;
inScale.onChange = updateScale;

const shader = new CGL.Shader(cgl, "fullscreenrectangle", this);
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

shader.setSource(attachments.shader_vert, attachments.shader_frag);
shader.fullscreenRectUniform = new CGL.Uniform(shader, "t", "tex", 0);
shader.texScaleUni = new CGL.Uniform(shader, "2f", "texScale", [1, 1]);
shader.texOffsetUni = new CGL.Uniform(shader, "2f", "texOffset", [0, 0]);

let useShader = false;
let updateShaderLater = true;
let fitImageAspect = false;
let coverImageAspect = false;

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
    inCropOffset.setUiAttribs({ "greyout": !inTexture.isLinked() || !coverImageAspect });
}

function updateShader()
{
    let tex = inTexture.get();
    if (tex) useShader = true;
    else useShader = false;
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
    coverImageAspect = inScale.get() == "Cover";
    updateUi();
}

function updateTexScale()
{
    const tex = inTexture.get();
    if (!coverImageAspect || !tex || !w || !h)
    {
        shader.texScaleUni.setValue([1, 1]);
        shader.texOffsetUni.setValue([0, 0]);
        return;
    }

    const texRatio = tex.width / tex.height;
    const viewRatio = w / h;
    const cropOffset = inCropOffset.get();

    if (texRatio > viewRatio)
    {
        const scaleX = viewRatio / texRatio;
        shader.texScaleUni.setValue([scaleX, 1]);
        const dirX = flipX.get() ? -1 : 1;
        shader.texOffsetUni.setValue([dirX * cropOffset * (1 - scaleX) / 2, 0]);
    }
    else
    {
        const scaleY = texRatio / viewRatio;
        shader.texScaleUni.setValue([1, scaleY]);
        const dirY = flipY.get() ? 1 : -1;
        shader.texOffsetUni.setValue([0, dirY * cropOffset * (1 - scaleY) / 2]);
    }
}

function doRender()
{
    if (cgl.viewPort[2] != w || cgl.viewPort[3] != h || !mesh) rebuild();

    if (updateShaderLater) updateShader();
    updateTexScale();

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);
    mat4.ortho(cgl.pMatrix, 0, w, h, 0, -10.0, 1000);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

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

        cgl.pushViewPort((w - _w) / 2, (h - _h) / 2, _w, _h);
    }

    if (useShader)
    {
        if (inTexture.get()) cgl.setTexture(0, inTexture.get().tex);
        mesh.render(shader);
    }
    else
    {
        mesh.render(cgl.getShader());
    }

    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    if (fitImageAspect && inTexture.get()) cgl.popViewPort();

    trigger.trigger();
}

function rebuildFlip()
{
    mesh = null;
}

function rebuild()
{
    if (cgl.viewPort[2] == w && cgl.viewPort[3] == h && mesh) return;

    let xx = 0, xy = 0;

    w = cgl.viewPort[2];
    h = cgl.viewPort[3];

    geom.vertices = new Float32Array([
        xx + w, xy + h, 0.0,
        xx, xy + h, 0.0,
        xx + w, xy, 0.0,
        xx, xy, 0.0
    ]);

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
        0, 0, 1,
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

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);
}
