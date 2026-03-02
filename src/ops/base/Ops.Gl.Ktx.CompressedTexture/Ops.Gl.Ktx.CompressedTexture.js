const
    filename = op.inUrl("File", [".ktx2"]),
    textureOut = op.outTexture("Texture"),
    addCacheBust = op.inBool("Add Cachebuster", false),
    inReload = op.inTriggerButton("Reload"),
    width = op.outNumber("Width"),
    height = op.outNumber("Height"),
    ratio = op.outNumber("Aspect Ratio"),
    loaded = op.outBoolNum("Loaded", 0),
    loading = op.outBoolNum("Loading", 0);

const cgl = op.patch.cgl;

// op.toWorkPortsNeedToBeLinked(textureOut);
op.setPortGroup("Size", [width, height]);
let ktx = CABLES.ktx;

if (!ktx)
{
    createKtxReadModule({ "locateFile": () =>
    {
        return attachments.libktx_read_wasm_base64;
    }
    }).then(async (_ktx) =>
    {
        ktx = CABLES.ktx = _ktx;
        console.log("op.patch.cgl.canvas", op.patch.cgl.canvas);

        ktx.GL.makeContextCurrent(ktx.GL.createContext(op.patch.cgl.canvas, { "majorVersion": 2 }));
        // ktx.GL.makeContextCurrent(op.patch.cgl.gl, { "majorVersion": 2 });
        reloadSoon();
    });
}

async function loadKTX2Texture(url)
{
    console.log("jajajaj", ktx, url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

    const blob = await res.blob();
    const ab = await blob.arrayBuffer();
    // .then((blob) => new Uint8Array(blob.arrayBuffer()));
    const bytes = new Uint8Array(ab);
    console.log("bytes", bytes);

    const ktex = new ktx.texture(bytes);
    const texture = uploadTextureToGl(op.patch.cgl.gl, ktex);
    console.log("tex", ktex, texture);

    // ktex.delete();
    // Upload via libktx's GL upload support; returns WebGLTexture + target. [page:3]
    // const { texture, target } = tex.glUpload();

    // gl.bindTexture(target, texture);
    // gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    // gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
}

function uploadTextureToGl(gl, ktexture)
{
    let HDRsupported = false;
    let astcSupported = !!op.patch.cgl.gl.getExtension("WEBGL_compressed_texture_astc");
    let etcSupported = !!op.patch.cgl.gl.getExtension("WEBGL_compressed_texture_etc1");
    let dxtSupported = !!op.patch.cgl.gl.getExtension("WEBGL_compressed_texture_s3tc");
    let bptcSupported = !!op.patch.cgl.gl.getExtension("EXT_texture_compression_bptc");
    let pvrtcSupported = !!(op.patch.cgl.gl.getExtension("WEBGL_compressed_texture_pvrtc")) || !!(gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"));
    if (astcSupported)HDRsupported = gl.getExtension("WEBGL_compressed_texture_astc").getSupportedProfiles().includes("hdr");

    const { transcode_fmt } = ktx;
    let formatString;
    console.log("transcode_fmt", transcode_fmt);

    // if (ktexture.isTranscodable)
    {
        let format;
        if (ktexture.isHDR)
        {
            const model = ktexture.colorModel;

            // const model = ktexture.get
            if (astcSupported && HDRsupported)
            {
                if (ktx.khr_df_model.KHR_DF_MODEL_UASTC_HDR_4x4 == model)
                {
                    formatString = "ASTC_HDR_4x4";
                    format = transcode_fmt.ASTC_HDR_4x4_RGBA;
                }
                else
                {
                    formatString = "ASTC_HDR_6x6";
                    format = transcode_fmt.ASTC_HDR_6x6_RGBA;
                }
            }
            else if (bptcSupported)
            {
                formatString = "BC6HU";
                format = transcode_fmt.BC6HU;
            }
            else
            {
                formatString = "RGBA16F";
                format = transcode_fmt.RGBA16F;
            }
        }
        else
        {
            if (astcSupported)
            {
                formatString = "ASTC";
                format = transcode_fmt.ASTC_4x4_RGBA;
            }
            else if (dxtSupported)
            {
                formatString = ktexture.numComponents == 4 ? "BC3" : "BC1";
                format = transcode_fmt.BC1_OR_3;
            }
            else if (pvrtcSupported)
            {
                formatString = "PVRTC1";
                format = transcode_fmt.PVRTC1_4_RGBA;
            }
            else if (etcSupported)
            {
                formatString = "ETC";
                format = transcode_fmt.ETC;
            }
            else
            {
                formatString = "RGBA4444";
                format = transcode_fmt.RGBA4444;
            }
        }
        /* UASTC_HDR_4x4_RGBA is regular ASTC_HDR_4x4_RGBA so we use directly without transcoding */
        if (format !== transcode_fmt.ASTC_HDR_4x4_RGBA)
        {
            if (ktexture.transcodeBasis(format, 0) != ktx.error_code.SUCCESS)
            {
                console.log("Texture transcode failed. See console for details.");
                return undefined;
            }
        }
    }
    // else
    // {
    //     console.log("not transcodable");
    // }

    const result = ktexture.glUpload();
    if (result.error != gl.NO_ERROR)
    {
        console.log("WebGL error when uploading texture, code = "
          + result.error.toString(16));
        return undefined;
    }
    if (result.object === undefined)
    {
        console.log("Texture upload failed. See console for details.", result);
        return undefined;
    }
    if (result.target != gl.TEXTURE_2D)
    {
        alert("Loaded texture is not a TEXTURE2D.");
        return undefined;
    }

    console.log("result", result);

    return {
        "target": result.target,
        "object": result.object,
        "format": formatString,
        "uvMatrix": null
    };
}

/// /////////////////////////////////////////////////////

let loadedFilename = null;
let loadingId = null;
let tex = null;
let cgl_filter = CGL.Texture.FILTER_MIPMAP;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let cgl_aniso = 0;
let timedLoader = 0;

console.log(attachments);

filename.onChange = reloadSoon;

textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));

inReload.onTriggered = reloadSoon;

const setTempTexture = function ()
{
    const t = CGL.Texture.getTempTexture(cgl);
    textureOut.setRef(t);
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        realReload(nocache);
    }, 1);
}

function getPixelFormat()
{
    if (dataFrmt.get() == "R") return CGL.Texture.PFORMATSTR_R8UB;
    if (dataFrmt.get() == "RG") return CGL.Texture.PFORMATSTR_RG8UB;
    if (dataFrmt.get() == "RGB") return CGL.Texture.PFORMATSTR_RGB8UB;
    if (dataFrmt.get() == "SRGBA") return CGL.Texture.PFORMATSTR_SRGBA8;

    return CGL.Texture.PFORMATSTR_RGBA8UB;
}

function realReload(nocache)
{
    if (!CABLES.ktx) return;
    op.checkMainloopExists();
    if (loadingId)loadingId = op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start(op.objName, filename.get(), op);

    let url = op.patch.getFilePath(String(filename.get()));

    if (addCacheBust.get() || nocache === true) url = CABLES.cacheBust(url);

    if (String(filename.get()).indexOf("data:") == 0) url = filename.get();

    let needsRefresh = false;
    loadedFilename = filename.get();

    if ((filename.get() && filename.get().length > 1))
    {
        loaded.set(false);
        loading.set(true);

        const fileToLoad = filename.get();
        setTempTexture();
        op.setUiAttrib({ "extendTitle": CABLES.basename(url) });
        if (needsRefresh) op.refreshParams();

        op.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);

            loadKTX2Texture(url).then(
                (texture) =>
                {
                    // }
                // );

                    console.log("Loaded KTX2 texture", texture);

                    // CGL.Texture.load(cgl, url, function (err, newTex)
                    // {
                    //     if (filename.get() != fileToLoad)
                    //     {
                    //         loadingId = op.patch.loading.finished(loadingId);
                    //         return;
                    //     }

                    //     if (tex)tex.delete();

                    //     if (err)
                    //     {
                    //         const t = CGL.Texture.getErrorTexture(cgl);
                    //         textureOut.setRef(t);

                    //         op.setUiError("urlerror", "could not load texture: \"" + filename.get() + "\"", 2);
                    //         loadingId = op.patch.loading.finished(loadingId);
                    //         return;
                    //     }

                    //     width.set(newTex.width);
                    //     height.set(newTex.height);
                    //     ratio.set(newTex.width / newTex.height);

                    //     tex = newTex;
                    const ctex = new CGL.Texture(op.patch.cgl, { "ktx": texture, "type": texture.target, "compression": true });
                    ctex.width = 100;
                    ctex.height = 100;
                    textureOut.setRef(ctex);
                    console.log("ktx texture", texture, texture.target);

                    loading.set(false);
                    loaded.set(true);

                    //     if (inFreeMemory.get()) tex.image = null;

                    if (loadingId)
                        loadingId = op.patch.loading.finished(loadingId);

                    //     op.checkMainloopExists();
                    // }, {
                    //     "anisotropic": cgl_aniso,
                    //     "wrap": cgl_wrap,
                    //     "flip": flip.get(),
                    //     "unpackAlpha": unpackAlpha.get(),
                    //     "pixelFormat": getPixelFormat(),
                    //     "filter": cgl_filter
                }).catch((e) =>
            {
                console.log("errrrrrrr", e);

                if (loadingId)
                    loadingId = op.patch.loading.finished(loadingId);

                loading.set(false);
                loaded.set(true);
            });

            op.checkMainloopExists();
        });
    }
    else
    {
        setTempTexture();
        loadingId = op.patch.loading.finished(loadingId);
    }
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        textureOut.setRef(CGL.Texture.getEmptyTexture(op.patch.cgl));
        textureOut.setRef(CGL.Texture.getTempTexture(cgl));
        realReload(true);
    }
};
