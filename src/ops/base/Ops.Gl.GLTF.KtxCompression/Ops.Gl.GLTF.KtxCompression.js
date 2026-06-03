const cgl = op.patch.cgl;

let HDRsupported = false;
let astcSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_astc");
let etcSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_etc1");
let dxtSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_s3tc");
let bptcSupported = !!cgl.gl.getExtension("EXT_texture_compression_bptc");
let pvrtcSupported = !!(cgl.gl.getExtension("WEBGL_compressed_texture_pvrtc")) || !!(cgl.gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"));
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
    console.log("load ktx");
    createKtxReadModule({ "locateFile": () =>
    {
        return "data:application/wasm;base64," + staticAttachments.libktx_read_wasm;
    }
    }).then(async (_ktx) =>
    {
        console.log("ktx loaded...", op.patch.cgl.canvas);
        ktx = CABLES.ktx = _ktx;
        // console.log("op.patch.cgl.canvas", op.patch.cgl.canvas);

        ktx.GL.makeContextCurrent(ktx.GL.createContext(op.patch.cgl.canvas, { "majorVersion": 2 }));
        staticAttachments.libktx_read_wasm = null;
    });
}

function loadKTX2Texture(url, cb)
{
    const gl = op.patch.cgl.gl;

    fetch(url).then((res) =>
    {
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

        res.blob().then((blob) =>
        {
            blob.arrayBuffer().then((ab) =>
            {
                const bytes = new Uint8Array(ab);
                const ktex = new ktx.texture(bytes);

                console.log("ktex", ktex.baseWidth);
                // setTimeout(() =>
                // {

                cgl.addNextFrameOnceCallback(() =>
                {
                    console.log("frame", op.patch.getFrameNum());

                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                    const texture = uploadTextureToGl(op.patch.cgl.gl, ktex);

                    // gl.bindTexture(texture.target, texture.object);
                    // gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    // gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    // // ktex.delete();
                    setTimeout(() =>
                    {

                        cb(texture, ktex.baseWidth, ktex.baseHeight);
                    }, 1000);
                });
                // }, Math.random() * 10000);

            }).catch((e) =>
            {
                console.error("errr", e);
            });

        }).catch((e) =>
        {
            console.error("errr", e);
        });

    }).catch((e) =>
    {
        console.error("err fetch", e);

    });
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
    // console.log("formmmm", transcode_fmt.ETC2_RGBA, transcode_fmt.PVRTC1_4_RGBA);
    const srgb = ktexture.isSRGB; // true for albedo/color textures

    // Prefer ASTC → DXT → ETC → uncompressed fallback
    if (formats.astc) return transcode_fmt.ASTC_4x4_RGBA;
    if (formats.dxt) return srgb ?
        transcode_fmt.BC3_RGBA : // DXT5, sRGB path
        transcode_fmt.BC1_OR_3;
    if (formats.etc) return transcode_fmt.ETC2_RGBA;
    if (formats.pvrtc) return transcode_fmt.PVRTC1_4_RGBA;

    return transcode_fmt.RGBA32; // uncompressed fallback
}

function uploadTextureToGl(gl, ktexture)
{
    const { transcode_fmt } = ktx;
    // let formatString;
    // console.log("transcode_fmt", transcode_fmt);

    // if (ktexture.isTranscodable)
    {
        let format;

        const transferFunction = ktexture.oetf; // KHR_DF_TRANSFER_SRGB or KHR_DF_TRANSFER_LINEAR
        const isSRGB = ktexture.isHDR;// (transferFunction === LIBKTX.KHR_DF_TRANSFER_SRGB);
        // console.log("ktexture.needsTranscoding", ktexture.needsTranscoding);

        // console.log(`Texture is ${isSRGB ? "sRGB" : "linear"}`);
        // {
        let frmt = chooseBestFormat(ktexture);
        frmt = ktx.transcode_fmt.RGBA32;
        frmt = ktx.transcode_fmt.ETC2_RGBA;
        // frmt = transcode_fmt.ASTC_4x4_RGBA;
        // console.log("format", frmt);
        if (ktexture.transcodeBasis(frmt, 0) != ktx.error_code.SUCCESS)
        {
            console.log("Texture transcode failed. See console for details.");
            return undefined;
        }
        // }
    }
    // else
    // {
    //     console.log("not transcodable");
    // }
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    const result = ktexture.glUpload();
    // console.log("result", result);
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

    // console.log("text", gl.getError());
    // op.patch.cgl.gl.generateMipmap(result.target);

    gl.getError();
    // console.log("result", formatString);

    return {
        "target": result.target,
        "object": result.object,
        // "format": formatString,
        "uvMatrix": null
    };
}

/// /////////////////////////////////////////////////////

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

            loadKTX2Texture(url, (texture, w, h) =>
            {
                const ctex = new CGL.Texture(op.patch.cgl, { "filter": CGL.Texture.FILTER_LINEAR, "ktx": texture, "type": texture.target, "compression": true });
                ctex.width = w;
                ctex.height = h;

                cb(ctex);

                if (loadingId) loadingId = op.patch.loading.finished(loadingId);

            });
        });
        //   ).catch((e) =>
        // {
        //     console.log("ktxer", e);

        //     if (loadingId) loadingId = op.patch.loading.finished(loadingId);
        // });

        op.checkMainloopExists();

    }
    else
    {
        console.log("SET TEMPP TEX");
        setTempTexture();
        loadingId = op.patch.loading.finished(loadingId);
    }
};
