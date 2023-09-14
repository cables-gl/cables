const
    inTex = op.inTexture("Texture In"),
    inShowInfo = op.inBool("Show Info", false),
    inVizRange = op.inSwitch("Visualize outside 0-1", ["Off", "Anim"], "Anim"),

    inPickColor = op.inBool("Show Color", false),
    inX = op.inFloatSlider("X", 0.5),
    inY = op.inFloatSlider("Y", 0.5),

    outTex = op.outTexture("Texture Out"),
    outInfo = op.outString("Info");

op.setUiAttrib({ "height": 150, "resizable": true });

const timer = new CABLES.Timer();
timer.play();

let shader = null;
let fb = null;
let pixelReader = null;
let colorString = "";

inVizRange.onChange = updateDefines;

inPickColor.onChange = updateUi;
updateUi();

function updateUi()
{
    inX.setUiAttribs({ "greyout": !inPickColor.get() });
    inY.setUiAttribs({ "greyout": !inPickColor.get() });
}

inTex.onChange = () =>
{
    const t = inTex.get();

    outTex.setRef(t);

    let title = "";

    if (inTex.get() && inTex.links[0]) title = inTex.links[0].getOtherPort(inTex).name;

    op.setUiAttrib({ "extendTitle": title });
};

function updateDefines()
{
    if (!shader) return;
    shader.toggleDefine("ANIM_RANGE", inVizRange.get() == "Anim");
}

op.renderVizLayer = (ctx, layer) =>
{
    const port = inTex;
    const texSlot = 5;
    const texSlotCubemap = texSlot + 1;

    const perf = CABLES.UI.uiProfiler.start("previewlayer texture");
    const cgl = port.op.patch.cgl;

    if (!layer.useGl) return;

    if (!this._emptyCubemap) this._emptyCubemap = CGL.Texture.getEmptyCubemapTexture(cgl);
    port.op.patch.cgl.profileData.profileTexPreviews++;

    const portTex = port.get() || CGL.Texture.getEmptyTexture(cgl);

    if (!this._mesh)
    {
        const geom = new CGL.Geometry("vizTexture rect");
        geom.vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
        geom.texCoords = [
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0];
        geom.verticesIndices = [0, 1, 2, 3, 1, 2];
        this._mesh = new CGL.Mesh(cgl, geom);
    }
    if (!this._shader)
    {
        this._shader = new CGL.Shader(cgl, "glpreviewtex");
        this._shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
        this._shader.setSource(attachments.viztex_vert, attachments.viztex_frag);
        this._shaderTexUniform = new CGL.Uniform(this._shader, "t", "tex", texSlot);
        this._shaderTexCubemapUniform = new CGL.Uniform(this._shader, "tc", "cubeMap", texSlotCubemap);
        shader = this._shader;
        updateDefines();

        this._shaderTexUniformW = new CGL.Uniform(this._shader, "f", "width", portTex.width);
        this._shaderTexUniformH = new CGL.Uniform(this._shader, "f", "height", portTex.height);
        this._shaderTypeUniform = new CGL.Uniform(this._shader, "f", "type", 0);
        this._shaderTimeUniform = new CGL.Uniform(this._shader, "f", "time", 0);
    }

    cgl.pushPMatrix();
    const sizeTex = [portTex.width, portTex.height];
    const small = port.op.patch.cgl.canvasWidth > sizeTex[0] && port.op.patch.cgl.canvasHeight > sizeTex[1];

    if (small)
    {
        mat4.ortho(cgl.pMatrix, 0, port.op.patch.cgl.canvasWidth, port.op.patch.cgl.canvasHeight, 0, 0.001, 11);
    }
    else mat4.ortho(cgl.pMatrix, -1, 1, 1, -1, 0.001, 11);

    const oldTex = cgl.getTexture(texSlot);
    const oldTexCubemap = cgl.getTexture(texSlotCubemap);

    let texType = 0;
    if (!portTex) return;
    if (portTex.cubemap) texType = 1;
    if (portTex.textureType == CGL.Texture.TYPE_DEPTH) texType = 2;

    if (texType == 0 || texType == 2)
    {
        cgl.setTexture(texSlot, portTex.tex);
        cgl.setTexture(texSlotCubemap, this._emptyCubemap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    }
    else if (texType == 1)
    {
        cgl.setTexture(texSlotCubemap, portTex.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    }

    timer.update();
    this._shaderTimeUniform.setValue(timer.get());

    this._shaderTypeUniform.setValue(texType);
    let s = [port.op.patch.cgl.canvasWidth, port.op.patch.cgl.canvasHeight];

    cgl.gl.clearColor(0, 0, 0, 0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    cgl.pushModelMatrix();
    if (small)
    {
        s = sizeTex;
        mat4.translate(cgl.mMatrix, cgl.mMatrix, [sizeTex[0] / 2, sizeTex[1] / 2, 0]);
        mat4.scale(cgl.mMatrix, cgl.mMatrix, [sizeTex[0] / 2, sizeTex[1] / 2, 0]);
    }
    this._mesh.render(this._shader);
    cgl.popModelMatrix();

    if (texType == 0) cgl.setTexture(texSlot, oldTex);
    if (texType == 1) cgl.setTexture(texSlotCubemap, oldTexCubemap);

    cgl.popPMatrix();
    cgl.resetViewPort();

    const sizeImg = [layer.width, layer.height];

    const stretch = false;
    if (!stretch)
    {
        if (portTex.width > portTex.height) sizeImg[1] = layer.width * sizeTex[1] / sizeTex[0];
        else
        {
            sizeImg[1] = layer.width * (sizeTex[1] / sizeTex[0]);

            if (sizeImg[1] > layer.height)
            {
                const r = layer.height / sizeImg[1];
                sizeImg[0] *= r;
                sizeImg[1] *= r;
            }
        }
    }

    const scaledDown = sizeImg[0] > sizeTex[0] && sizeImg[1] > sizeTex[1];

    ctx.imageSmoothingEnabled = !small || !scaledDown;

    if (!ctx.imageSmoothingEnabled)
    {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(layer.x, layer.y - 10, 10, 10);
        ctx.fillStyle = "#000000";
        ctx.fillRect(layer.x, layer.y - 10, 5, 5);
        ctx.fillRect(layer.x + 5, layer.y - 10 + 5, 5, 5);
    }

    let numX = (10 * layer.width / layer.height);
    let stepY = (layer.height / 10);
    let stepX = (layer.width / numX);
    for (let x = 0; x < numX; x++)
        for (let y = 0; y < 10; y++)
        {
            if ((x + y) % 2 == 0)ctx.fillStyle = "#333333";
            else ctx.fillStyle = "#393939";
            ctx.fillRect(layer.x + stepX * x, layer.y + stepY * y, stepX, stepY);
        }

    ctx.fillStyle = "#222";
    const borderLeft = (layer.width - sizeImg[0]) / 2;
    const borderTop = (layer.height - sizeImg[1]) / 2;
    ctx.fillRect(
        layer.x, layer.y, borderLeft, (layer.height)
    );
    ctx.fillRect(
        layer.x + sizeImg[0] + borderLeft, layer.y, borderLeft, (layer.height)
    );
    ctx.fillRect(
        layer.x, layer.y, layer.width, borderTop
    );
    ctx.fillRect(
        layer.x, layer.y + sizeImg[1] + borderTop, layer.width, borderTop
    );

    if (sizeTex[1] == 1)
        ctx.drawImage(cgl.canvas,
            0,
            0,
            s[0],
            s[1],
            layer.x,
            layer.y,
            layer.width,
            layer.height * 5);// workaround filtering problems
    if (sizeTex[0] == 1)
        ctx.drawImage(cgl.canvas,
            0,
            0,
            s[0],
            s[1],
            layer.x,
            layer.y,
            layer.width * 5,
            layer.height); // workaround filtering problems
    else
        ctx.drawImage(cgl.canvas,
            0,
            0,
            s[0],
            s[1],
            layer.x + (layer.width - sizeImg[0]) / 2,
            layer.y + (layer.height - sizeImg[1]) / 2,
            sizeImg[0],
            sizeImg[1]);

    let info = "unknown";

    if (port.get() && port.get().getInfoOneLine) info = port.get().getInfoOneLine();

    if (inShowInfo.get())
    {
        ctx.save();
        ctx.scale(layer.scale, layer.scale);
        ctx.font = "normal 10px sourceCodePro";
        ctx.fillStyle = "#000";
        ctx.fillText(info, layer.x / layer.scale + 5 + 0.5, (layer.y + layer.height) / layer.scale - 5 + 0.5);
        ctx.fillStyle = "#fff";
        ctx.fillText(info, layer.x / layer.scale + 5, (layer.y + layer.height) / layer.scale - 5);
        ctx.restore();
    }

    if (inPickColor.get())
    {
        ctx.save();
        ctx.scale(layer.scale, layer.scale);
        ctx.font = "normal 10px sourceCodePro";
        ctx.fillStyle = "#000";
        ctx.fillText("RGBA " + colorString, layer.x / layer.scale + 10 + 0.5, layer.y / layer.scale + 10 + 0.5);
        ctx.fillStyle = "#fff";
        ctx.fillText("RGBA " + colorString, layer.x / layer.scale + 10, layer.y / layer.scale + 10);

        ctx.restore();

        ctx.fillStyle = "#000";
        ctx.fillRect(
            layer.x + layer.width * inX.get() - 1,
            layer.y + sizeImg[1] * inY.get() - 10 + borderTop,
            3,
            20);

        ctx.fillRect(
            layer.x + layer.width * inX.get() - 10,
            layer.y + sizeImg[1] * inY.get() - 1 + borderTop,
            20,
            3);

        ctx.fillStyle = "#fff";
        ctx.fillRect(
            layer.x + layer.width * inX.get() - 1,
            layer.y + sizeImg[1] * inY.get() - 10 + borderTop,
            1,
            20);

        ctx.fillRect(
            layer.x + layer.width * inX.get() - 10,
            layer.y + sizeImg[1] * inY.get() - 1 + borderTop,
            20,
            1);
    }

    outInfo.set(info);

    if (inPickColor.get())
    {
        const gl = cgl.gl;

        const realTexture = inTex.get();
        if (!realTexture)
        {
            colorString = "";
            return;
        }
        if (!fb) fb = gl.createFramebuffer();
        if (!pixelReader) pixelReader = new CGL.PixelReader();

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, realTexture.tex, 0
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        pixelReader.read(cgl, fb, realTexture.textureType, inX.get() * realTexture.width, realTexture.height - inY.get() * realTexture.height, 1, 1, (pixel) =>
        {
            if (realTexture.textureType != CGL.Texture.TYPE_FLOAT)colorString = Math.floor(pixel[0] / 255 * 100) / 100 + "," + Math.floor(pixel[1] / 255 * 100) / 100 + "," + Math.floor(pixel[2] / 255 * 100) / 100 + "," + Math.floor(pixel[3] / 255 * 100) / 100;
            else colorString = Math.round(pixel[0] * 100) / 100 + "," + Math.round(pixel[1] * 100) / 100 + "," + Math.round(pixel[2] * 100) / 100 + "," + Math.round(pixel[3] * 100) / 100;
        });
    }

    cgl.gl.clearColor(0, 0, 0, 0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    perf.finish();
};
