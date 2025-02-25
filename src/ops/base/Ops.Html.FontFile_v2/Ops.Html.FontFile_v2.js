const
    filename = op.inUrl("file", [".otf", ".ttf", ".woff", ".woff2"]),
    fontname = op.inString("family"),
    inActive = op.inBool("Active", true),
    outLoaded = op.outBoolNum("Loaded"),
    loadedTrigger = op.outTrigger("Loaded Trigger");

let loadingId = null;
let fontFaceObj;
let doc = null;
let to = null;
let style = null;
let oldFontName = "";

filename.onChange = function ()
{
    outLoaded.set(false);
    addStyle(null);
};

inActive.onChange =
fontname.onChange = () =>
{
    loadSoon();
};

function loadSoon()
{
    clearTimeout(to);
    to = setTimeout(() =>
    {
        addStyle(null);
    }, 50);
}

op.patch.on("windowChanged",
    (win) =>
    {
        fontFaceObj = null;
        addStyle(win.document);
    });

function addStyle(_doc)
{
    if (style)style.remove();

    if (fontFaceObj)
    {
        const success = doc.fonts.delete(fontFaceObj);
        fontFaceObj = null;

        setTimeout(() => // delete needs some time, so we delay this a bit.....
        {
            op.patch.emitEvent("fontLoaded", oldFontName);
        }, 100);
    }

    if (!inActive.get()) return;
    doc = _doc || doc || op.patch.cgl.canvas.ownerDocument || document;

    if (loadingId)loadingId = op.patch.cgl.patch.loading.finished(loadingId);

    op.setUiError("loadingerror", null);

    oldFontName = fontname.get();

    if (filename.get() && fontname.get())
    {
        if (doc.fonts)
        {
            let url = "url(\"" + op.patch.getFilePath(String(filename.get())) + "\")";
            fontFaceObj = new FontFace(fontname.get(), url);

            loadingId = op.patch.cgl.patch.loading.start("FontFile", filename.get(), op);
            // Add the FontFace to the FontFaceSet
            doc.fonts.add(fontFaceObj);

            // Get the current status of the FontFace
            // (should be 'unloaded')

            // Load the FontFace

            // Get the current status of the Fontface
            // (should be 'loading' or 'loaded' if cached)

            // Wait until the font has been loaded, log the current status.
            fontFaceObj.loaded.then((fontFace) =>
            {
                outLoaded.set(true);
                loadedTrigger.trigger();
                loadingId = op.patch.cgl.patch.loading.finished(loadingId);

                op.patch.emitEvent("fontLoaded", fontname.get());

                // Throw an error if loading wasn't successful
            }, (fontFace) =>
            {
                op.setUiError("loadingerror", "Font loading error: " + fontFaceObj.status + "(" + filename.get() + ")");
                loadingId = op.patch.cgl.patch.loading.finished(loadingId);
                outLoaded.set(true);

                // op.logError("Font loading error! Current status", fontFaceObj.status);
            }).catch((f) =>
            {
                loadingId = op.patch.cgl.patch.loading.finished(loadingId);
                console.error("catch ", f);
            });

            fontFaceObj.load();
        }
        else
        { // font loading api not supported
            const fileUrl = op.patch.getFilePath(String(filename.get()));
            const styleStr = ""
                .endl() + "@font-face"
                .endl() + "{"
                .endl() + "  font-family: \"" + fontname.get() + "\";"
                .endl() + "  src: url(\"" + fileUrl + "\") format(\"truetype\");"
                .endl() + "}";

            style = document.createElement("style");
            style.classList.add("cablesEle");
            style.type = "text/css";
            style.innerHTML = styleStr;
            document.getElementsByTagName("head")[document.getElementsByTagName("head").length - 1].appendChild(style);
            // TODO: Poll if font loaded
        }
    }
}
