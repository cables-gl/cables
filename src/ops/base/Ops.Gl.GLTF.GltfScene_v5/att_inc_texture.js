let GltfTexture = class
{
    scale = [1, 1];
    offset = [0, 0];
    previewUri = null;
    cgl_filter = CGL.Texture.FILTER_MIPMAP;
    cgl_wrap = CGL.Texture.WRAP_CLAMP;
    tex = CGL.Texture.getEmptyTexture(cgl);
    sampler = null;

    constructor(gltf, _idx, texInfo, _sampler)
    {
        this.sampler = _sampler;

        if (!gltf.json.images) return console.log("no json images?");

        let idx = _idx;
        let img = gltf.json.images[idx];

        if (!img) return console.log("no image found?!", idx, gltf.json.images);

        const buffView = gltf.json.bufferViews[img.bufferView];
        let dv = gltf.chunks[1].dataView;

        if (texInfo.extensions && texInfo.extensions.KHR_texture_transform)
        {
            this.scale = texInfo.extensions.KHR_texture_transform.scale;
            this.offset = texInfo.extensions.KHR_texture_transform.offset;
        }

        if (!buffView) return console.log("no buffview tex");

        const data = new Uint8Array(buffView.byteLength);

        for (let i = 0; i < buffView.byteLength; i++) data[i] = dv.getUint8(buffView.byteOffset + i);

        const blob = new Blob([data.buffer], { "type": img.mimeType });
        const sourceURI = URL.createObjectURL(blob);

        if (freeMem.get() == "All") gltf.json.bufferViews[img.bufferView] = null;

        if (CABLES.UI) this.previewUri = sourceURI;

        this.cgl_wrap = CGL.Texture.WRAP_REPEAT;

        if (this.sampler)
        {
            if (this.sampler.minFilter == 9984) this.cgl_filter = CGL.Texture.FILTER_NEAREST;
            if (this.sampler.minFilter == 9728) this.cgl_filter = CGL.Texture.FILTER_NEAREST;
            if (this.sampler.minFilter == 9729) this.cgl_filter = CGL.Texture.FILTER_LINEAR;

            if (this.sampler.wrapS == 33071) this.cgl_wrap = CGL.Texture.WRAP_CLAMP;
            if (this.sampler.wrapS == 10497) this.cgl_wrap = CGL.Texture.WRAP_REPEAT;
            if (this.sampler.wrapS == 33648) this.cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
        }

        const cgl_aniso = 4;
        const loadingId = cgl.patch.loading.start("gltfTexture", "gltftexture", op);

        if (img.mimeType == "image/ktx2")
        {
            this.tex = CGL.Texture.getEmptyTexture(cgl);

            CABLES.loadKtx(sourceURI, (t) =>
            {
                this.tex = t;
                cgl.patch.loading.finished(loadingId);
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
                "wrap": this.cgl_wrap,
                "flip": false,
                // "unpackAlpha": unpackAlpha.get(),
                "imgBitmap": true,
                "filter": this.cgl_filter
            });

        if (!this.tex)console.log("notex!???");
    }

    getInfoLine()
    {
        let str = this.tex.width + " x " + this.tex.height + " ";
        if (this.cgl_wrap == CGL.Texture.WRAP_CLAMP)str += "clamp";
        else if (this.cgl_wrap == CGL.Texture.WRAP_REPEAT)str += "repeat";
        else if (this.cgl_wrap == CGL.Texture.WRAP_MIRRORED_REPEAT)str += "mirror repeat";
        else str += "unknown wrap";
        str += ",";
        if (this.cgl_filter == CGL.Texture.FILTER_LINEAR)str += "linear";
        else if (this.cgl_filter == CGL.Texture.FILTER_NEAREST)str += "nearest";
        else if (this.cgl_filter == CGL.Texture.FILTER_MIPMAP)str += "mipmap";
        else str += "unknown filter";
        return str;
    }

    dispose()
    {
        this.tex = this.tex.dispose();
    }
};
