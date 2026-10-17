const
    inFile = op.inUrl("File"),
    inReload = op.inTriggerButton("Reload"),
    inCacheBust = op.inBool("Add Cachebuster", false),
    outDataUrl = op.outString("Data Url", ""),
    outMimeType = op.outString("Mime Type", ""),
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

outDataUrl.ignoreValueSerialize = true;

let loadCount = 0;
let loadingId = null;

inFile.onChange =
    inCacheBust.onChange =
    inReload.onTriggered = () => { load(); };

function finishLoading()
{
    if (loadingId) loadingId = op.patch.loading.finished(loadingId);
    outLoading.set(false);
}

function setResult(dataUrl, mimeType)
{
    outMimeType.set(mimeType);
    outDataUrl.set(dataUrl);
}

function getMimeType(url, type)
{
    const GENERIC_MIME_TYPES = ["", "application/octet-stream", "binary/octet-stream"];
    if (!GENERIC_MIME_TYPES.includes(type)) return type;
    const extension = url.split(/[?#]/)[0].split(".").pop().toLowerCase();
    return EXTENSION_MIME_TYPES[extension] || "application/octet-stream";
}

function readAsDataUrl(blob)
{
    return new Promise((resolve, reject) =>
    {
        const reader = new FileReader();
        reader.onload = () => { resolve(reader.result); };
        reader.onerror = () => { reject(reader.error); };
        reader.readAsDataURL(blob);
    });
}

function load()
{
    const thisLoad = ++loadCount;
    finishLoading();
    outError.set("");
    op.setUiError("load", null);

    const file = String(inFile.get() || "");
    if (!file) return setResult("", "");

    let url = file;
    if (!file.startsWith("blob:") && !file.startsWith("data:"))
    {
        url = op.patch.getFilePath(file);
        if (inCacheBust.get()) url = CABLES.cacheBust(url);
    }
    loadingId = op.patch.loading.start("dataurl", url, op);
    outLoading.set(true);

    const setFailed = (msg) =>
    {
        if (thisLoad != loadCount) return;
        finishLoading();
        setResult("", "");
        outError.set(msg);
        op.setUiError("load", msg, 2);
    };

    let mimeType = "";
    fetch(url)
        .then((response) =>
        {
            if (response.ok) return response.blob();
            setFailed("could not load file: " + response.status + " " + response.statusText);
            return null;
        })
        .then((blob) =>
        {
            if (!blob) return null;
            if (!blob.size)
            {
                setFailed("file is empty or does not exist: " + file);
                return null;
            }
            mimeType = getMimeType(url, blob.type);
            return readAsDataUrl(new Blob([blob], { "type": mimeType }));
        })
        .then((dataUrl) =>
        {
            if (!dataUrl || thisLoad != loadCount) return;
            finishLoading();
            setResult(dataUrl, mimeType);
            outLoaded.trigger();
        })
        .catch((e) => { setFailed(String(e.message || e)); });
}
op.onDelete = () =>
{
    loadCount++;
    finishLoading();
};
