const
    inFile = op.inUrl("CSS File"),
    inMedia = op.inString("Media", "all"),
    inActive = op.inBool("Active", true),
    inReload = op.inTriggerButton("Reload");

let element = null;

op.onDelete = remove;
inMedia.onChange = setAttribs;
inFile.onChange = create;

op.onFileChanged = (fn) =>
{
    if (inFile.get() && inFile.get().indexOf(fn) > -1) create(true);
};

inActive.onChange = () =>
{
    if (!inActive.get())remove();
    else create(true);
    updateUi();
};

inReload.onTriggered = () =>
{
    remove();
    create(true);
};

function updateUi()
{
    if (!inActive.get()) op.setUiAttrib({ "extendTitle": "x" });
    else op.setUiAttrib({ "extendTitle": "" });
}

function create(refresh)
{
    if (!inActive.get()) return;
    remove();
    element = op.patch.getDocument().createElement("link");
    op.patch.getDocument().head.appendChild(element);
    setAttribs();
    let url = inFile.get();
    if (op.patch.isEditorMode() && refresh) url = CABLES.cacheBust(url);
    element.setAttribute("href", url);
    updateUi();
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
