let GltfTexture = class
{

  scale=[1,1]
offset=[0,0]

    constructor(gltf, _idx, texInfo)
    {
        this.tex = CGL.Texture.getEmptyTexture(cgl);

        if (!gltf.json.images) return;

        let idx = gltf.json.textures[_idx].source;

        let img = gltf.json.images[idx];
        if (!img)
        {
            console.log("no image found?!", idx);
            return;
        }

        const buffView = gltf.json.bufferViews[img.bufferView];
        let dv = gltf.chunks[1].dataView;

        if (texInfo.extensions && texInfo.extensions.KHR_texture_transform)
        {
            // console.log(texInfo.extensions.KHR_texture_transform.offset);
            // console.log(texInfo.extensions.KHR_texture_transform.scale);
            this.scale=texInfo.extensions.KHR_texture_transform.scale
            this.offset=texInfo.extensions.KHR_texture_transform.offset

        }

        if (!buffView) return;
        const data = new Uint8Array(buffView.byteLength);

        for (let i = 0; i < buffView.byteLength; i++) data[i] = dv.getUint8(buffView.byteOffset + i);

        const blob = new Blob([data.buffer], { "type": img.mimeType });
        const sourceURI = URL.createObjectURL(blob);

        let cgl_wrap = CGL.Texture.WRAP_CLAMP;
        // if(scale[0]!=1||scale[1]!=1)
          cgl_wrap = CGL.Texture.WRAP_REPEAT;

        const cgl_filter = CGL.Texture.FILTER_MIPMAP;
        const cgl_aniso = 4;
        const loadingId = cgl.patch.loading.start("gltfTexture", CABLES.uuid(), op);

        this.tex = CGL.Texture.load(cgl, sourceURI, (err) =>
        {
            cgl.patch.loading.finished(loadingId);

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
