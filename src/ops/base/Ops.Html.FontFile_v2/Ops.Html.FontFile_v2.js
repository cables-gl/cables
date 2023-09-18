const
    filename = op.inUrl("file", [".otf", ".ttf", ".woff", ".woff2"]),
    fontname = op.inString("family"),
    outLoaded = op.outBoolNum("Loaded"),
    loadedTrigger = op.outTrigger("Loaded Trigger");

let loadingId = null;

filename.onChange = function ()
{
    outLoaded.set(false);
    addStyle();
};

fontname.onChange = addStyle;

let fontFaceObj;

function addStyle()
{
    if (filename.get() && fontname.get())
    {
        if (document.fonts)
        {
            fontFaceObj = new FontFace(fontname.get(), "url(" + op.patch.getFilePath(String(filename.get())) + ")");

            loadingId = op.patch.cgl.patch.loading.start("FontFile", filename.get(), op);

            // Add the FontFace to the FontFaceSet
            document.fonts.add(fontFaceObj);

            // Get the current status of the FontFace
            // (should be 'unloaded')

            // Load the FontFace
            fontFaceObj.load();

            // Get the current status of the Fontface
            // (should be 'loading' or 'loaded' if cached)

            // Wait until the font has been loaded, log the current status.
            fontFaceObj.loaded.then((fontFace) =>
            {
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

                // op.logError("Font loading error! Current status", fontFaceObj.status);
            });
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
        }
    }
}
