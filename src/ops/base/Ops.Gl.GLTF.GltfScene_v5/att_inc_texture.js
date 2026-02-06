let GltfTexture = class
{
    constructor(gltf, idx)
    {
        this.tex = CGL.Texture.getEmptyTexture(cgl);

        if (!gltf.json.images) return;

        let img = gltf.json.images[idx];

        const buffView = gltf.json.bufferViews[img.bufferView];
        let dv = gltf.chunks[1].dataView;

        if (!buffView) return;
        const data = new Uint8Array(buffView.byteLength);

        for (let i = 0; i < buffView.byteLength; i++) data[i] = dv.getUint8(buffView.byteOffset + i);

        const blob = new Blob([data.buffer], { "type": img.mimeType });
        const sourceURI = URL.createObjectURL(blob);

        const cgl_filter = CGL.Texture.FILTER_MIPMAP;
        const cgl_aniso = 4;
        const cgl_wrap = CGL.Texture.WRAP_REPEAT;
        const loadingId = cgl.patch.loading.start("gltfTexture", CABLES.uuid(), op);

        this.tex = CGL.Texture.load(cgl, sourceURI, (err) =>
        {
            cgl.patch.loading.finished(loadingId);
            console.log("loaded", this.tex);
            if (!this.tex) return;
            if (err)
            {
                console.error("img load error", err);
            }
        }, {
            "anisotropic": cgl_aniso,
            "wrap": cgl_wrap,
            "flip": false,
            // "unpackAlpha": unpackAlpha.get(),
            "filter": cgl_filter
        });
    }
};
