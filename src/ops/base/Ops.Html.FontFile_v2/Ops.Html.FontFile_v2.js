const
    filename = op.inUrl("file", [".otf", ".ttf", ".woff", ".woff2"]),
    fontname = op.inString("family"),
    outLoaded = op.outBoolNum("Loaded"),
    loadedTrigger = op.outTrigger("Loaded Trigger");

let loadingId = null;

let doc = null;
let fontFaceObj;

filename.onChange = function ()
{
    outLoaded.set(false);
    addStyle(null);
};

fontname.onChange = () =>
{
    addStyle(null);
};

op.patch.on("windowChanged",
    (win) =>
    {
        fontFaceObj = null;
        console.log("window changed!");
        addStyle(win.document);
    });

function addStyle(_doc)
{
    doc = _doc || doc || op.patch.cgl.canvas.ownerDocument || document;

    console.log(doc.fonts, document.fonts);

    if (filename.get() && fontname.get())
    {
        if (doc.fonts)
        {
            let url = "url(" + op.patch.getFilePath(String(filename.get())) + ")";
            fontFaceObj = new FontFace(fontname.get(), url);

            loadingId = op.patch.cgl.patch.loading.start("FontFile", filename.get(), op);
            console.log("load font!!!", url);
            // Add the FontFace to the FontFaceSet
            doc.fonts.add(fontFaceObj);

            console.log(doc.title);
            // Get the current status of the FontFace
            // (should be 'unloaded')

            // Load the FontFace

            // Get the current status of the Fontface
            // (should be 'loading' or 'loaded' if cached)

            // Wait until the font has been loaded, log the current status.
            fontFaceObj.loaded.then((fontFace) =>
            {
                console.log("loaded font....", fontFace);
                outLoaded.set(true);
                loadedTrigger.trigger();
                op.patch.cgl.patch.loading.finished(loadingId);

                op.patch.emitEvent("fontLoaded", fontname.get());

                // Throw an error if loading wasn't successful
            }, (fontFace) =>
            {
                op.setUiError("loadingerror", "Font loading error!" + fontFaceObj.status);
                op.patch.cgl.patch.loading.finished(loadingId);
                outLoaded.set(true);

                console.log("font loading error");

                // op.logError("Font loading error! Current status", fontFaceObj.status);
            }).catch((f) =>
            {
                console.log("catch ?!?!?!?!?!?!", f);
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

            const style = document.createElement("style");
            style.type = "text/css";
            style.innerHTML = styleStr;
            document.getElementsByTagName("head")[document.getElementsByTagName("head").length - 1].appendChild(style);
            // TODO: Poll if font loaded

            console.log("fallback?!");
        }
    }
}
