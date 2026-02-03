const
    numCols = op.inInt("Columns", 3),
    inDir = op.inSwitch("Axis", ["Columns", "Rows"], "Columns"),
    inHelper = op.inBool("Show Helper"),
    inActive = op.inBool("Active", true),
    inSizes = op.inMultiPort("Cell Size", CABLES.OP_PORT_TYPE_STRING),
    inObjs = op.inMultiPort("Childs", CABLES.OP_PORT_TYPE_OBJECT),
    outElement = op.outObject("Element");

const div = op.patch.getDocument().createElement("div");
div.dataset.op = op.id;
div.classList.add("cablesEle");
inSizes.setUiAttribs({ "multiPortManual": true });
inObjs.setUiAttribs({ "multiPortManual": true });

op.patch.cgl.canvas.parentElement.appendChild(div);
outElement.setRef(div);
create();
outElement.onLinkChanged =
inDir.onChange = inActive.onChange =
numCols.onChange = inObjs.onChange = inHelper.onChange = create;
inSizes.onChange = updateStyle;

function updateStyle()
{
    let count = 0;
    let colStr = "";

    const colSizes = inSizes.get();
    for (let j = 0; j < numCols.get(); j++) if (colSizes.length >= j && colSizes[j])colStr += (colSizes[j].get() || "1fr") + " ";

    div.style.width = "100%";
    div.style.maxHeight = "100%";
    div.style.height = "100%";
    div.style["grid-template-columns"] = "initial";
    div.style["grid-template-rows"] = "initial";
    div.style["grid-template-" + inDir.get().toLowerCase()] = colStr;

    if (inActive.get()) div.style.display = "grid";
    else div.style.display = "none";

    if (!outElement.isLinked()) div.style.position = "absolute";
    else div.style.position = "relative";
}

function create()
{
    div.replaceChildren();
    inSizes.setUiAttribs({ "hideMultiPortUi": true, "multiPortNum": numCols.get() });
    op.setUiAttrib({ "extendTitle": inDir.get() });

    if (inObjs.uiAttribs.multiPortNum != numCols.get())
    {
        inObjs.onChange = null;
        inObjs.setUiAttribs({ "hideMultiPortUi": true, "multiPortNum": numCols.get() });
        inObjs.onChange = create;
    }
    let count = 0;
    let foundposerr = false;
    for (let j = 0; j < numCols.get(); j++)
    {
        if (inSizes.get()[count].get() == "")inSizes.get()[count].set("1fr");

        const eles = inObjs.get();
        if (eles[count] && eles[count].isLinked())
        {
            if (eles[count].get())
            {
                div.appendChild(eles[count].get());
                if (eles[count].get().style.position == "absolute") foundposerr = true;
            }
            else console.log("child prob", count, eles[count]);
        }
        else
        {
            const c = op.patch.getDocument().createElement("div");
            if (inHelper.get())
            {
                if (inDir.get() == "Rows") c.style.border = "5px solid #bbffbb";
                else c.style.border = "5px solid #bbbbff";

                c.style.borderRadius = "8px";
                c.style.textAlign = "center";
                c.style.fontSize = "20px";
                c.style.fontFamily = "monospace";
                c.innerHTML = count;
            }
            c.style.pointerEvents = "none";
            div.appendChild(c);
        }

        count++;
    }
    if (foundposerr)op.setUiError("elepos", "Child element position should be relative");
    else op.setUiError("elepos", null);

    updateStyle();
}

op.onDelete = () =>
{
    div.remove();
};
