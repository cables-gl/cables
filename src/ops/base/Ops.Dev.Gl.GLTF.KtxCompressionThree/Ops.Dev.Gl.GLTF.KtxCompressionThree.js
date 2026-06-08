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

if (!ktx && window.KTX2Loader)
{
    console.log("load ktx");
    const _ktx = KTX2Loader.create(cgl, atob(staticAttachments.basis_transcoder_wasm), attachments.basis_transcoder);
    ktx = CABLES.ktx = _ktx;
}

function loadKTX2Texture(url, cb)
{
    const gl = op.patch.cgl.gl;
    cgl.addNextFrameOnceCallback(() =>
    {
        console.log("KTXLOAD", url);
        CABLES.ktx.load(url, (transcodeResult) =>
        {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            console.log("ktx transcodeResult", transcodeResult);
            // gl.bindTexture(texture.target, texture.object);
            // gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            // gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            const ktex = {
                "object": CGL.Texture.getEmptyTexture(cgl).tex,
                "target": gl.TEXTURE_2D,
                "baseWidth": transcodeResult.width,
                "baseHeight": transcodeResult.height
            };

            cgl.addNextFrameOnceCallback(() =>
            {
                cb(ktex, ktex.baseWidth, ktex.baseHeight);
            });
        }, () =>
        {
            console.log("ktx progress");
        }, (e) =>
        {
            console.error("ktx err", e);
        });
    });
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

                console.log("CTEX", ctex);
                cb(ctex);

                if (loadingId) loadingId = op.patch.loading.finished(loadingId);

            });
        });
        op.checkMainloopExists();

    }
    else
    {
        console.log("SET TEMPP TEX");
        setTempTexture();
        loadingId = op.patch.loading.finished(loadingId);
    }
};
