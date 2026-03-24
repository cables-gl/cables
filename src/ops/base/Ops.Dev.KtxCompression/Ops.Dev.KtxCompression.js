const cgl = op.patch.cgl;

let HDRsupported = false;
let astcSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_astc");
let etcSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_etc1");
let dxtSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_s3tc");
let bptcSupported = !!cgl.gl.getExtension("EXT_texture_compression_bptc");
let pvrtcSupported = !!(cgl.gl.getExtension("WEBGL_compressed_texture_pvrtc")) || !!(gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"));
if (astcSupported)HDRsupported = cgl.gl.getExtension("WEBGL_compressed_texture_astc").getSupportedProfiles().includes("hdr");

op.outBoolNum("Support ASTC", astcSupported);
op.outBoolNum("Support ETC1", etcSupported);
op.outBoolNum("Support S3TC", dxtSupported);
op.outBoolNum("Support BPTC", bptcSupported);
op.outBoolNum("Support PVRTC", pvrtcSupported);
op.outBoolNum("Support ASTC HDR", HDRsupported);

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
        // console.log("op.patch.cgl.canvas", op.patch.cgl.canvas);

        ktx.GL.makeContextCurrent(ktx.GL.createContext(op.patch.cgl.canvas, { "majorVersion": 2 }));
    });
}

async function loadKTX2Texture(url)
{
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

    const blob = await res.blob();
    const ab = await blob.arrayBuffer();
    // .then((blob) => new Uint8Array(blob.arrayBuffer()));
    const bytes = new Uint8Array(ab);
    // console.log("bytes", bytes);

    const ktex = new ktx.texture(bytes);

    // width.set(ktex.baseWidth);
    // height.set(ktex.baseHeight);
    // ratio.set(ktex.baseWidth / ktex.baseHeight);
    // outIsRGB.set(ktex.isSrgb);

    const texture = uploadTextureToGl(op.patch.cgl.gl, ktex);
    // console.log("tex", ktex, texture);

    // ktex.delete();
    // Upload via libktx's GL upload support; returns WebGLTexture + target. [page:3]
    // const { texture, target } = tex.glUpload();

    // gl.bindTexture(target, texture);
    // gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    // gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
}

function chooseBestFormat(ktexture)
{
    const formats = {
        "astc": !!op.patch.cgl.gl.getExtension("WEBGL_compressed_texture_astc"),
        "dxt": !!op.patch.cgl.gl.getExtension("WEBGL_compressed_texture_s3tc"),
        "pvrtc": !!op.patch.cgl.gl.getExtension("WEBGL_compressed_texture_pvrtc"),
        "etc": !!op.patch.cgl.gl.getExtension("WEBGL_compressed_texture_etc"),
    };

    const { transcode_fmt } = ktx;
    console.log("formmmm", transcode_fmt.ETC2_RGBA, transcode_fmt.PVRTC1_4_RGBA);
    const srgb = ktexture.isSRGB; // true for albedo/color textures

    // Prefer ASTC → DXT → ETC → uncompressed fallback
    if (formats.astc) return transcode_fmt.ASTC_4x4_RGBA;
    if (formats.dxt) return srgb
        ? transcode_fmt.BC3_RGBA // DXT5, sRGB path
        : transcode_fmt.BC1_OR_3;
    if (formats.etc) return transcode_fmt.ETC2_RGBA;
    if (formats.pvrtc) return transcode_fmt.PVRTC1_4_RGBA;

    return transcode_fmt.RGBA32; // uncompressed fallback
}

function uploadTextureToGl(gl, ktexture)
{
    const { transcode_fmt } = ktx;
    let formatString;
    // console.log("transcode_fmt", transcode_fmt);

    // if (ktexture.isTranscodable)
    {
        let format;

        const transferFunction = ktexture.oetf; // KHR_DF_TRANSFER_SRGB or KHR_DF_TRANSFER_LINEAR
        const isSRGB = ktexture.isHDR;// (transferFunction === LIBKTX.KHR_DF_TRANSFER_SRGB);
        console.log("ktexture.needsTranscoding", ktexture.needsTranscoding);

        console.log(`Texture is ${isSRGB ? "sRGB" : "linear"}`);
        {
            let frmt = chooseBestFormat(ktexture);
            frmt = ktx.transcode_fmt.RGBA32;
            frmt = ktx.transcode_fmt.ETC2_RGBA;
            // frmt = transcode_fmt.ASTC_4x4_RGBA;
            console.log("format", frmt);
            if (ktexture.transcodeBasis(frmt, 0) != ktx.error_code.SUCCESS)
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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    const result = ktexture.glUpload();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    if (result.error != gl.NO_ERROR)
    {
        console.log("WebGL error when uploading texture, code = " + result.error.toString(16));
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
    op.patch.cgl.gl.generateMipmap(result.target);

    console.log("result", formatString);

    return {
        "target": result.target,
        "object": result.object,
        "format": formatString,
        "uvMatrix": null
    };
}

/// /////////////////////////////////////////////////////

let cgl_filter = CGL.Texture.FILTER_MIPMAP;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let cgl_aniso = 0;
let timedLoader = 0;
let loadingId = null;

CABLES.loadKtx = function (url, cb)
{
    if (!CABLES.ktx) return console.log("no ktx");
    op.checkMainloopExists();
    if (loadingId)loadingId = op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start(op.objName, CABLES.uuid(), op);

    // if (String(filename.get()).indexOf("data:") == 0) url = filename.get();

    let needsRefresh = false;
    // loadedFilename = filename.get();

    if (url)
    {
        op.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);

            loadKTX2Texture(url).then(
                (texture) =>
                {
                    // }
                // );

                    // console.log("Loaded KTX2 texture", texture);

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
                    const ctex = new CGL.Texture(op.patch.cgl, { "filter": CGL.Texture.FILTER_LINEAR, "ktx": texture, "type": texture.target, "compression": true });
                    ctex.width = 100;
                    ctex.height = 100;
                    // textureOut.setRef(ctex);
                    // console.log("ktx texture", texture, texture.target);

                    //     if (inFreeMemory.get()) tex.image = null;
                    cb(ctex);

                    if (loadingId) loadingId = op.patch.loading.finished(loadingId);

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
                console.log("ktxer", e);

                if (loadingId)
                    loadingId = op.patch.loading.finished(loadingId);
            });

            op.checkMainloopExists();
        });
    }
    else
    {
        setTempTexture();
        loadingId = op.patch.loading.finished(loadingId);
    }
};
