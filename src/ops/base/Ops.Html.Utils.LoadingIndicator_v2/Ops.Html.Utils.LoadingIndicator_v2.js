const
    inVisible = op.inSwitch("Visible", ["Hidden", "Visible", "Auto"], "Auto"),
    inCenter = op.inBool("Center Position", true),
    inStyle = op.inSwitch("Style", ["Spinner", "Ring", "Ellipsis"], "Ring");

const div = document.createElement("div");
div.dataset.op = op.id;
const canvas = op.patch.cgl.canvas.parentElement;

const
    outEle = op.outObject("Elment", div, "element"),
    outReqs = op.outArray("Requests");

inCenter.onChange =
inStyle.onChange = updateStyle;

div.appendChild(document.createElement("div"));
div.appendChild(document.createElement("div"));
div.appendChild(document.createElement("div"));

const size = 50;

div.style.width = size + "px";
div.style.height = size + "px";

div.style.position = "absolute";
div.style["z-index"] = "999999";
div.style["pointer-events"] = "none";

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

op.patch.loading.on("finishedTask", updateStatus);
op.patch.loading.on("finishedAll", updateStatus);
op.patch.loading.on("startTask", updateStatus);
op.patch.loading.on("addAssetTask", updateStatus);

function updateStatus()
{
    if (inVisible.get() == "Auto")
        updateVisible();
    outReqs.setRef(op.patch.loading.getListJobs());
    if (op.patch.loading.getListJobs().length != 0 || op.patch.loading.getProgress() != 1)setTimeout(updateStatus, 100);
}

function updateStyle()
{
    if (inCenter.get())
    {
        div.style.top = "50%";
        div.style.left = "50%";
        div.style["margin-left"] = "-" + size / 2 + "px";
        div.style["margin-top"] = "-" + size / 2 + "px";
    }
    else
    {
        div.style.top = 0;
        div.style.left = 0;
        div.style["margin-left"] = 0;
        div.style["margin-top"] = 0;
    }

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
    outEle.setRef(div);
}

function remove()
{
    div.remove();
}

function updateVisible()
{
    if (inVisible.get() == "Auto")div.style.display = op.patch.loading.getListJobs().length == 0 ? "none" : "block";
    if (inVisible.get() == "Visible")div.style.display = "block";
    if (inVisible.get() == "Hidden")div.style.display = "none";
}
