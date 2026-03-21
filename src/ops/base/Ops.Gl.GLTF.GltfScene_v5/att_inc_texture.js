let GltfTexture = class
{
    constructor(gltf, _idx, texInfo)
    {
        this.scale = [1, 1];
        this.offset = [0, 0];
        this.previewUri = null;
        this.tex = CGL.Texture.getEmptyTexture(cgl);
        if (!gltf.json.images)
        {
            console.log("no json images?");
            return;
        }

        let idx = _idx;

        let img = gltf.json.images[idx];
        if (!img)
        {
            console.log("no image found?!", idx, gltf.json.images);
            return;
        }

        const buffView = gltf.json.bufferViews[img.bufferView];
        let dv = gltf.chunks[1].dataView;

        if (texInfo.extensions && texInfo.extensions.KHR_texture_transform)
        {
            this.scale = texInfo.extensions.KHR_texture_transform.scale;
            this.offset = texInfo.extensions.KHR_texture_transform.offset;
        }

        if (!buffView)
        {
            console.log("no buffview tex");
            return;
        }

        const data = new Uint8Array(buffView.byteLength);

        for (let i = 0; i < buffView.byteLength; i++) data[i] = dv.getUint8(buffView.byteOffset + i);

        const blob = new Blob([data.buffer], { "type": img.mimeType });
        const sourceURI = URL.createObjectURL(blob);

        if (CABLES.UI) this.previewUri = sourceURI;

        let cgl_wrap = CGL.Texture.WRAP_CLAMP;
        // if(scale[0]!=1||scale[1]!=1)
        cgl_wrap = CGL.Texture.WRAP_REPEAT;

        const cgl_filter = CGL.Texture.FILTER_MIPMAP;
        const cgl_aniso = 4;
        const loadingId = cgl.patch.loading.start("gltfTexture", CABLES.uuid(), op);

        // console.log("img.mimetyp", img.mimeType);
        if (img.mimeType == "image/ktx2")
        {
            this.tex = CGL.Texture.getEmptyTexture(cgl);

            CABLES.loadKtx(sourceURI, (t) =>
            {
                this.tex = t;
            });
        }
        else
            this.tex = CGL.Texture.load(cgl, sourceURI, (err) =>
            {
                cgl.patch.loading.finished(loadingId);

                if (err)
                {
                    console.error("img load error", err);
                    if (!this.tex) return;
                }
            }, {
                "anisotropic": cgl_aniso,
                "wrap": cgl_wrap,
                "flip": false,
                // "unpackAlpha": unpackAlpha.get(),
                "filter": cgl_filter
            });
        if (!this.tex)console.log("notex!???");
    }

    dispose()
    {
        this.tex = this.tex.dispose();
    }
};
