const
    inFile = op.inUrl("CSS File"),
    inMedia = op.inString("Media", "all"),
    inActive = op.inBool("Active", true);

let element = null;

op.onDelete = remove;
inMedia.onChange = setAttribs;
inFile.onChange = create;

op.onFileChanged = (fn) =>
{
    if (inFile.get() && inFile.get().indexOf(fn) > -1) create();
}
;
inActive.onChange = () =>
{
    if (!inActive.get())remove();
    else create();
};

function create()
{
    if (!inActive.get()) return;
    remove();
    element = op.patch.getDocument().createElement("link");
    op.patch.getDocument().head.appendChild(element);
    setAttribs();
    element.setAttribute("href", inFile.get());
}

function setAttribs()
{
    if (!element)create();
    if (element)
    {
        element.setAttribute("rel", "stylesheet");
        element.setAttribute("type", "text/css");
        element.setAttribute("media", inMedia.get());
    }
}

function remove()
{
    if (element)element.remove();
    element = null;
}
