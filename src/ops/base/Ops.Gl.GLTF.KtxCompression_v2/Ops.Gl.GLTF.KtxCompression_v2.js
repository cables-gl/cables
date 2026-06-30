const cgl = op.patch.cgl;

let HDRsupported = false;
let astcSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_astc");
let etcSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_etc1");
let dxtSupported = !!cgl.gl.getExtension("WEBGL_compressed_texture_s3tc");
let bptcSupported = !!cgl.gl.getExtension("EXT_texture_compression_bptc");
let pvrtcSupported = !!(cgl.gl.getExtension("WEBGL_compressed_texture_pvrtc")) || !!(cgl.gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"));
if (astcSupported) HDRsupported = cgl.gl.getExtension("WEBGL_compressed_texture_astc").getSupportedProfiles().includes("hdr");

op.outBoolNum("Support ASTC", astcSupported);
op.outBoolNum("Support ETC1", etcSupported);
op.outBoolNum("Support S3TC", dxtSupported);
op.outBoolNum("Support BPTC", bptcSupported);
op.outBoolNum("Support PVRTC", pvrtcSupported);
op.outBoolNum("Support ASTC HDR", HDRsupported);

let ktx = CABLES.ktx;

if (!ktx && window.KTX2Loader)
{
    const _ktx = KTX2Loader.create(cgl, atob(staticAttachments.basis_transcoder_wasm), attachments.basis_transcoder);
    ktx = CABLES.ktx = _ktx;
}

/// /////////////////////////////////////////////////////

let cgl_aniso = 0;
let timedLoader = 0;
let loadingId = null;

CABLES.loadKtx = function (url, cb, opts)
{
    if (!CABLES.ktx) return op.logError("no ktx");
    op.checkMainloopExists();
    if (loadingId) loadingId = op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start(op.objName, CABLES.uuid(), op);

    if (url)
    {
        op.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);

            CABLES.ktx.load(url, (transcodeResult) =>
            {
                const ctex = new CGL.Texture(op.patch.cgl,
                    {
                        "compression": true,
                        "wrap": opts?.wrap || CGL.Texture.WRAP_REPEAT,
                        "filter": opts?.filter || CGL.Texture.FILTER_LINEAR,
                        "name": "ktx " + opts.name + transcodeResult.width + "x" + transcodeResult.height,
                        "width": transcodeResult.width,
                        "height": transcodeResult.height
                    });

                ctex.setFormat({ "glDataFormat": transcodeResult.format });

                ctex.width = transcodeResult.width;
                ctex.height = transcodeResult.height;
                ctex.initFromMipMapData(transcodeResult.faces[0].mipmaps);
                cb(ctex);

            }, () =>
            {
                // console.log("ktx progress");
            }, (e) => {});

            if (loadingId) loadingId = op.patch.loading.finished(loadingId);

        });
        op.checkMainloopExists();

    }
    else
    {
        setTempTexture();
        loadingId = op.patch.loading.finished(loadingId);
    }
};
