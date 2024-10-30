let code = op.addInPort(new CABLES.Port(op, "css code", CABLES.OP_PORT_TYPE_VALUE, { "display": "editor", "editorSyntax": "css" }));

let styleEle = null;
let eleId = "css_" + CABLES.uuid();

code.onChange = update;
update();

function getCssContent()
{
    return code.get();
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
        styleEle.textContent = getCssContent();

        let head = document.getElementsByTagName("body")[0];
        head.appendChild(styleEle);
    }
}

op.onDelete = function ()
{
    styleEle = document.getElementById(eleId);
    if (styleEle)styleEle.remove();
};
