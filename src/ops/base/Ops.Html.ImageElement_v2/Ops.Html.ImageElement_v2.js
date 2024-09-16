const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif", ".svg"]),
    inPos = op.inSwitch("Position", ["Absolute", "Static", "Relative", "Fixed"], "Absolute"),
    inClass = op.inString("Class"),
    inStyle = op.inStringEditor("Style", "", "inline-css"),
    inDisplay = op.inSwitch("CSS Display", ["not set", "none"], "not set"),
    outImage = op.outObject("Image Element", null, "element"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height");

let element = op.patch.getDocument().createElement("img");

op.onDelete = removeEle;

inClass.onChange = updateClass;
inStyle.onChange = updateStyle;

filename.onChange = filenameChanged;

inPos.onChange = updateStyle;
updateStyle();

element.onload = () =>
{
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
};
function filenameChanged(cacheBuster)
{
    let url = filename.get();

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
    outImage.setRef(element);
}

//
