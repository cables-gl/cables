const code = op.inStringEditor("css code");

code.setUiAttribs({ "editorSyntax": "css" });

let styleEle = null;
const eleId = "css_" + CABLES.uuid();

code.onChange = update;
update();

function getCssContent()
{
    let css = code.get();
    css = css.replaceAll("{{ASSETPATH}}", op.patch.getAssetPath());
    return css;
}

function update()
{
    styleEle = document.getElementById(eleId);

    if (styleEle)
    {
        styleEle.textContent = getCssContent();
    }
    else
    {
        styleEle = document.createElement("style");
        styleEle.type = "text/css";
        styleEle.id = eleId;
        styleEle.textContent = attachments.css_spinner;

        const head = document.getElementsByTagName("body")[0];
        head.appendChild(styleEle);
    }
}

op.onDelete = function ()
{
    styleEle = document.getElementById(eleId);
    if (styleEle)styleEle.remove();
};
