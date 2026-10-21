const
    inFile = op.inUrl("File"),
    inReload = op.inTriggerButton("Reload"),
    inCacheBust = op.inBool("Add Cachebuster", false),
    outBlobUrl = op.outString("Blob Url", ""),
    outMimeType = op.outString("Mime Type", ""),
    outSize = op.outNumber("Size Bytes", 0),
    outLoading = op.outBoolNum("Loading", false),
    outLoaded = op.outTrigger("Loaded"),
    outError = op.outString("Error", "");

const EXTENSION_MIME_TYPES = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
    "avif": "image/avif",
    "bmp": "image/bmp",
    "ico": "image/x-icon",
    "svg": "image/svg+xml",
    "wav": "audio/wav",
    "mp3": "audio/mpeg",
    "ogg": "audio/ogg",
    "flac": "audio/flac",
    "m4a": "audio/mp4",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mov": "video/quicktime",
    "pdf": "application/pdf",
    "zip": "application/zip",
    "glb": "model/gltf-binary",
    "gltf": "model/gltf+json",
    "json": "application/json",
    "xml": "application/xml",
    "txt": "text/plain;charset=utf-8",
    "html": "text/html;charset=utf-8",
    "htm": "text/html;charset=utf-8",
    "css": "text/css;charset=utf-8",
    "js": "text/javascript;charset=utf-8",
    "csv": "text/csv;charset=utf-8",
    "md": "text/markdown;charset=utf-8",
    "ttf": "font/ttf",
    "otf": "font/otf",
    "woff": "font/woff",
    "woff2": "font/woff2"
};
const GENERIC_MIME_TYPES = ["", "application/octet-stream", "binary/octet-stream"];

outBlobUrl.ignoreValueSerialize = true;

let loadCount = 0;
let loadingId = null;
let blobUrl = null;

inFile.onChange =
    inCacheBust.onChange =
    inReload.onTriggered = () => { load(); };

op.onDelete = () =>
{
    loadCount++;
    finishLoading();
    revokeUrl();
};

function finishLoading()
{
    if (loadingId) loadingId = op.patch.loading.finished(loadingId);
    outLoading.set(false);
}

function revokeUrl()
{
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = null;
}

function setResult(blob, mimeType)
{
    revokeUrl();
    if (blob) blobUrl = URL.createObjectURL(blob);
    outMimeType.set(mimeType);
    outSize.set(blob ? blob.size : 0);
    outBlobUrl.set(blobUrl || "");
}

function getMimeType(url, type)
{
    if (!GENERIC_MIME_TYPES.includes(type)) return type;
    const extension = url.split(/[?#]/)[0].split(".").pop().toLowerCase();
    return EXTENSION_MIME_TYPES[extension] || "application/octet-stream";
}

function load()
{
    const thisLoad = ++loadCount;
    finishLoading();
    outError.set("");
    op.setUiError("load", null);

    const file = String(inFile.get() || "");
    if (!file) return setResult(null, "");

    let url = file;
    if (!file.startsWith("blob:") && !file.startsWith("data:"))
    {
        url = op.patch.getFilePath(file);
        if (inCacheBust.get()) url = CABLES.cacheBust(url);
    }
    loadingId = op.patch.loading.start("bloburl", url, op);
    outLoading.set(true);

    const setFailed = (msg) =>
    {
        if (thisLoad != loadCount) return;
        finishLoading();
        setResult(null, "");
        outError.set(msg);
        op.setUiError("load", msg, 2);
    };

    fetch(url)
        .then((response) =>
        {
            if (response.ok) return response.blob();
            setFailed("could not load file: " + response.status + " " + response.statusText);
            return null;
        })
        .then((blob) =>
        {
            if (!blob || thisLoad != loadCount) return;
            if (!blob.size)
            {
                setFailed("file is empty or does not exist: " + file);
                return;
            }
            const mimeType = getMimeType(url, blob.type);
            finishLoading();
            setResult(new Blob([blob], { "type": mimeType }), mimeType);
            outLoaded.trigger();
        })
        .catch((e) => { setFailed(String(e.message || e)); });
}
