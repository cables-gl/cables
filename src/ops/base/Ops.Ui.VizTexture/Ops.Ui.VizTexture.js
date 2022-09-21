const
    inTex = op.inTexture("Texture In"),
    outTex = op.outTexture("Texture Out"),
    outInfo = op.outString("Info");

op.setUiAttrib({ "height": 150, "resizable": true });

inTex.onChange = () =>
{
    const t = inTex.get();

    outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
    outTex.set(t);
};

op.renderVizLayer = (ctx, layer) =>
{
    const port = inTex;
    const texSlot = 5;
    const texSlotCubemap = texSlot + 1;

    const perf = CABLES.UI.uiProfiler.start("previewlayer texture");
    const cgl = port.parent.patch.cgl;

    if (!this._emptyCubemap) this._emptyCubemap = CGL.Texture.getEmptyCubemapTexture(cgl);
    port.parent.patch.cgl.profileData.profileTexPreviews++;

    const portTex = port.get() || CGL.Texture.getEmptyTexture(cgl);

    if (!this._mesh)
    {
        const geom = new CGL.Geometry("preview op rect");
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

        this._shaderTexUniformW = new CGL.Uniform(this._shader, "f", "width", portTex.width);
        this._shaderTexUniformH = new CGL.Uniform(this._shader, "f", "height", portTex.height);
        this._shaderTypeUniform = new CGL.Uniform(this._shader, "f", "type", 0);
    }

    cgl.pushPMatrix();
    const sizeTex = [portTex.width, portTex.height];
    const small = port.parent.patch.cgl.canvasWidth > sizeTex[0] && port.parent.patch.cgl.canvasHeight > sizeTex[1];

    if (small)
    {
        mat4.ortho(cgl.pMatrix, 0, port.parent.patch.cgl.canvasWidth, port.parent.patch.cgl.canvasHeight, 0, 0.001, 11);
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

    this._shaderTypeUniform.setValue(texType);
    let s = [port.parent.patch.cgl.canvasWidth, port.parent.patch.cgl.canvasHeight];

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

    if (sizeTex[1] == 1)
        ctx.drawImage(cgl.canvas,
            0, 0,
            s[0], s[1],
            layer.x, layer.y,
            layer.width, layer.height * 5);// workaround filtering problems
    if (sizeTex[0] == 1)
        ctx.drawImage(cgl.canvas,
            0, 0,
            s[0], s[1],
            layer.x, layer.y,
            layer.width * 5, layer.height); // workaround filtering problems
    else
        ctx.drawImage(cgl.canvas,
            0, 0,
            s[0], s[1],
            layer.x + (layer.width - sizeImg[0]) / 2, layer.y + (layer.height - sizeImg[1]) / 2,
            sizeImg[0], sizeImg[1]);

    if (port.get() && port.get().getInfoOneLine) outInfo.set(port.get().getInfoOneLine());
    else outInfo.set("unknown");

    cgl.gl.clearColor(0, 0, 0, 0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    perf.finish();
};
