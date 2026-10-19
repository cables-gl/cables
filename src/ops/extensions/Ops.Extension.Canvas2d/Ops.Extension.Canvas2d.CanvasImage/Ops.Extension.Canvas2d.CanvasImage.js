const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif", ".svg"]),
    outImage = op.outObject("Image Element", null, "element"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    loading = op.outBoolNum("Loading"),
    outError = op.outBoolNum("Error"),
    outLoaded = op.outTrigger("Loaded");

let element = op.patch.getDocument().createElement("img");

op.onDelete = removeEle;

filename.onChange = filenameChanged;

filenameChanged();

element.addEventListener("error", function (e)
{
    outError.set(true);
});

element.onload = () =>
{
    outError.set(false);
    if (element)
    {
        outWidth.set(element.width);
        outHeight.set(element.height);
    }
    else
    {
        outWidth.set(0);
        outHeight.set(0);
    }
    loading.set(false);
    outLoaded.trigger();
};

function filenameChanged(cacheBuster)
{
    let url = filename.get();
    if (!url) return outError.set(true);
    outError.set(false);

    loading.set(true);
    element.setAttribute("src", url);
    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });
    element.setAttribute("crossOrigin", "anonymous");
    outImage.setRef(element);
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        filenameChanged(true);
    }
};

function removeEle()
{
    if (element) element.remove();
    element = null;
    outImage.set(element);
}

function removeClasses()
{
    if (!element) return;

    const classes = (inClass.get() || "").split(" ");
    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i]) element.classList.remove(classes[i]);
    }
    oldClassesStr = "";
}
