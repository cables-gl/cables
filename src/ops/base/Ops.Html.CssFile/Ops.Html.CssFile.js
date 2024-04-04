const
    inFile = op.inUrl("CSS File"),
    inMedia = op.inString("Media", "all");

let element = null;

op.onDelete = remove;
inMedia.onChange = setAttribs;
inFile.onChange = create;

function create()
{
    remove();
    element = op.patch.getDocument().createElement("link");
    op.patch.getDocument().head.appendChild(element);
    setAttribs();
    element.setAttribute("href", inFile.get());
}

function setAttribs()
{
    if (!element)create();
    element.setAttribute("rel", "stylesheet");
    element.setAttribute("type", "text/css");
    element.setAttribute("media", inMedia.get());
}

function remove()
{
    if (element)element.remove();
    element = null;
}
