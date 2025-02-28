const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif", ".svg"]),
    inPos = op.inSwitch("Position", ["Absolute", "Static", "Relative", "Fixed"], "Absolute"),
    inClass = op.inString("Class"),
    inStyle = op.inStringEditor("Style", "", "inline-css"),
    inDisplay = op.inSwitch("CSS Display", ["not set", "none"], "not set"),
    inAlt = op.inString("Alt Text"),
    outImage = op.outObject("Image Element", null, "element"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    loading = op.outBoolNum("Loading"),
    outError = op.outBoolNum("Error"),
    outLoaded = op.outTrigger("Loaded");

let element = op.patch.getDocument().createElement("img");

op.patch.cgl.canvas.parentElement.appendChild(element);

op.onDelete = removeEle;

inClass.onChange = updateClass;

filename.onChange = filenameChanged;
inStyle.onChange =
    inAlt.onChange =
    inPos.onChange = updateStyle;

filenameChanged();
updateStyle();

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
    if (!url)
    {
        return;
        outError.set(true);
    }
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
    if (element)element.remove();
    element = null;
    outImage.set(element);
}

let oldClassesStr = "";

inDisplay.onChange = () =>
{
    if (inDisplay.get() == "not set") element.style.removeProperty("display");
    else element.style.display = inDisplay.get();
};

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

function updateClass()
{
    const classes = (inClass.get() || "").split(" ");
    const oldClasses = (oldClassesStr || "").split(" ");

    let found = false;

    for (let i = 0; i < oldClasses.length; i++)
    {
        if (
            oldClasses[i] &&
            classes.indexOf(oldClasses[i].trim()) == -1)
        {
            found = true;
            element.classList.remove(oldClasses[i]);
        }
    }

    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i])
        {
            element.classList.add(classes[i].trim());
        }
    }

    oldClassesStr = inClass.get();
}

function updateStyle()
{
    element.setAttribute("style", inStyle.get());
    element.style.position = inPos.get().toLowerCase();
    outImage.setRef(element);
    element.classList.add("cablesEle");
    element.dataset.op = op.id;
    element.setAttribute("alt", inAlt.get());
    outImage.setRef(element);
}

//
