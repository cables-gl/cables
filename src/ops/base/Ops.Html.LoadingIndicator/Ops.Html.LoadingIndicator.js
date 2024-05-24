const
    inVisible = op.inBool("Visible", true),
    inStyle = op.inSwitch("Style", ["Spinner", "Ring", "Ellipsis"], "Ring");

const div = document.createElement("div");
div.dataset.op = op.id;
const canvas = op.patch.cgl.canvas.parentElement;

inStyle.onChange = updateStyle;

div.appendChild(document.createElement("div"));
div.appendChild(document.createElement("div"));
div.appendChild(document.createElement("div"));

const size = 50;

div.style.width = size + "px";
div.style.height = size + "px";
div.style.top = "50%";
div.style.left = "50%";
div.style["pointer-events"] = "none";

div.style["margin-left"] = "-" + size / 2 + "px";
div.style["margin-top"] = "-" + size / 2 + "px";

div.style.position = "absolute";
div.style["z-index"] = "9999999";

inVisible.onChange = updateVisible;

let eleId = "css_loadingicon_" + CABLES.uuid();

const styleEle = document.createElement("style");
styleEle.type = "text/css";
styleEle.id = eleId;

let head = document.getElementsByTagName("body")[0];
head.appendChild(styleEle);

op.onDelete = () =>
{
    remove();
    if (styleEle)styleEle.remove();
};

canvas.appendChild(div);
updateStyle();

function updateStyle()
{
    const st = inStyle.get();
    if (st == "Spinner")
    {
        div.classList.add("_cables_spinner");
        styleEle.textContent = attachments.css_spinner_css;
    }
    else div.classList.remove("_cables_spinner");

    if (st == "Ring")
    {
        div.classList.add("lds-ring");
        styleEle.textContent = attachments.css_ring_css;
    }
    else div.classList.remove("lds-ring");

    if (st == "Ellipsis")
    {
        div.classList.add("lds-ellipsis");
        styleEle.textContent = attachments.css_ellipsis_css;
    }
    else div.classList.remove("lds-ellipsis");
}

function remove()
{
    div.remove();
}

function updateVisible()
{
    // remove();
    // if (inVisible.get()) canvas.appendChild(div);

    // div.style.display = inVisible.get() ? "block" : "none";
    div.style.opacity = inVisible.get() ? 1 : 0;
}
