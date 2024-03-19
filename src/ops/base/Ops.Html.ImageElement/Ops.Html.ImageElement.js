const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    inClass = op.inString("Class"),
    inStyle = op.inStringEditor("Style", "", "inline-css"),
    outImage = op.outObject("Image Element", null, "element");

let element = op.patch.getDocument().createElement("img");
op.onDelete = removeEle;

inClass.onChange = updateClass;
inStyle.onChange = updateStyle;

filename.onChange = () =>
{
    element.setAttribute("src", filename.get());
    element.setAttribute("crossOrigin", "anonymous");
    outImage.setRef(element);
};

function removeEle()
{
    if (element)element.remove();
    element = null;
    outImage.set(element);
}

let oldClassesStr = "";

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
}
