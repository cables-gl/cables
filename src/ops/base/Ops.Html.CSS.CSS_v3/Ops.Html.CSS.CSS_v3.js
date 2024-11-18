const
    code = op.inStringEditor("css code"),
    nest = op.inString("Nesting Parent", ""),
    inActive = op.inBool("Active", true);

code.setUiAttribs(
    {
        "editorSyntax": "css",
        "ignoreBigPort": true
    });

let styleEle = null;
const eleId = "css_" + CABLES.uuid();

nest.onChange =
code.onChange = update;
update();

inActive.onChange = () =>
{
    if (!inActive.get())styleEle.remove();
    else addElement();
};

function getCssContent()
{
    let css = code.get();

    if (nest.get())
    {
        css = nest.get() + "\n{\n" + css + "\n}\n";
    }

    if (css)
        css = css.replace(new RegExp("{{ASSETPATH}}", "g"), op.patch.getAssetPath());

    return css;
}

function update()
{
    styleEle = op.patch.getDocument().getElementById(eleId);

    if (styleEle)
    {
        styleEle.textContent = getCssContent();
    }
    else
    {
        styleEle = op.patch.getDocument().createElement("style");
        styleEle.type = "text/css";
        styleEle.id = eleId;
        styleEle.textContent = attachments.css_spinner;
        styleEle.classList.add("cablesEle");
        addElement();
    }
}

function addElement()
{
    const head = op.patch.getDocument().getElementsByTagName("body")[0];
    head.appendChild(styleEle);
}

op.onDelete = function ()
{
    styleEle = op.patch.getDocument().getElementById(eleId);
    if (styleEle)styleEle.remove();
};
