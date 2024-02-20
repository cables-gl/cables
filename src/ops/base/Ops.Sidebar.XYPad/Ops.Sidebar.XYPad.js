const
    parentPort = op.inObject("Link"),
    labelPort = op.inString("Text", "XY Pad"),
    inRange = op.inSwitch("Range", ["0-1", "-1-1"], "0-1"),
    inputX = op.inValueSlider("Input X", 0),
    inputY = op.inValueSlider("Input Y", 0),

    flipX = op.inBool("Flip X", false),
    flipY = op.inBool("Flip Y", false),

    setDefaultValueButtonPort = op.inTriggerButton("Set Default"),
    defaultValuePortX = op.inValueString("Default X", 0.5),
    defaultValuePortY = op.inValueString("Default Y", 0.5),

    inVisible = op.inBool("Visible", true),
    siblingsPort = op.outObject("Children"),
    outX = op.outNumber("X", 0.0),
    outY = op.outNumber("Y", 0.0),
    outEle = op.outObject("HTML Element", null, "element");

defaultValuePortX.setUiAttribs({ "hidePort": true, "greyout": true });
defaultValuePortY.setUiAttribs({ "hidePort": true, "greyout": true });

const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.addEventListener("dblclick", function ()
{
    setOutValue(defaultValuePortX.get(), defaultValuePortY.get());
    redraw();
});

el.classList.add("sidebar__item");
el.classList.add("sidebar__color-picker");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelTextNode = document.createTextNode(labelPort.get());
label.appendChild(labelTextNode);
el.appendChild(label);

const valueX = document.createElement("input");
valueX.classList.add("sidebar__text-input-input");
valueX.setAttribute("type", "text");
valueX.style.width = "40px";
valueX.style.backgroundColor = "transparent";
el.appendChild(valueX);

const valueY = document.createElement("input");
valueY.classList.add("sidebar__text-input-input");
valueY.setAttribute("type", "text");
valueY.style.width = "40px";
valueY.style.backgroundColor = "transparent";
el.appendChild(valueY);

valueX.addEventListener("input", valueInputChanged);
valueY.addEventListener("input", valueInputChanged);
setDefaultValueButtonPort.onTriggered = setDefaultValues;

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function valueInputChanged()
{
    let x = parseFloat(valueX.value);
    let y = parseFloat(valueY.value);

    if (x != x || y != y) return;

    let minX = 0;
    let maxX = 1;
    let minY = 0;
    let maxY = 1;

    x = Math.max(Math.min(x, maxX), minX);
    y = Math.max(Math.min(y, maxY), minY);

    if (inRange.get() == "-1-1")
    {
        minY = minX = -1;
        maxY = maxX = 1;
    }

    setOutValue(
        CABLES.map(x, minX, maxX, 0, 1),
        CABLES.map(y, minY, maxY, 0, 1)
    );
}

const size = 190;

const canv = document.createElement("canvas");
canv.width = canv.height = size;
canv.style.width = size + "px";
canv.style.height = size + "px";
canv.style.marginTop = "6px";
canv.style.position = "initial";
el.appendChild(canv);
outEle.setRef(canv);

const ctx = canv.getContext("2d");

parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
op.onDelete = onDelete;

inRange.onChange = () =>
{
    setOutValue(defaultValuePortX.get(), defaultValuePortY.get());

    redraw();
};

redraw();

flipX.onChange = flipY.onChange = () =>
{
    setOutValue(inputX.get(), inputY.get());
};

canv.addEventListener("pointerdown", (e) =>
{
    try { canv.setPointerCapture(e.pointerId); }
    catch (e) {}
});

canv.addEventListener("pointerup", (e) =>
{
    try { canv.releasePointerCapture(e.pointerId); }
    catch (e) {}
});

inputX.onChange = () =>
{
    // outX.set(Math.min(1, Math.max(inputX.get(), 0)));
    setOutValue(inputX.get(), inputY.get());
    // redraw();
};

inputY.onChange = () =>
{
    // outY.set(Math.min(1, Math.max(inputY.get(), 0)));
    setOutValue(inputX.get(), inputY.get());
    // redraw();
};

function move(e)
{
    if (e.buttons == 1)
    {
        let x = Math.min(size, Math.max(e.offsetX, 0));
        let y = Math.min(size, Math.max(e.offsetY, 0));

        if (e.shiftKey)
        {
            const s = size / 10;
            x = Math.round(x / s) * s;
            y = Math.round(y / s) * s;
        }

        setOutValue(x / size, y / size);
        inputX.set(x / size);
        inputY.set(y / size);
        op.refreshParams();
    }
}

canv.addEventListener("pointermove", move, false);
canv.addEventListener("pointerdown", move, false);

function setOutValue(x, y)
{
    inputX.set(x);
    inputY.set(y);

    if (flipX.get())x = 1 - x;
    if (flipY.get())y = 1 - y;

    let ox = x;
    let oy = y;

    if (inRange.get() == "0-1")
    {
        outX.set(ox);
        outY.set(oy);
    }
    else
    {
        outX.set(((ox) - 0.5) * 2.0);
        outY.set(((oy) - 0.5) * 2.0);
    }

    if (valueX.value != "" + outX.get()) valueX.value = "" + outX.get();
    if (valueY.value != "" + outY.get()) valueY.value = "" + outY.get();

    redraw();
}

function redraw()
{
    ctx.lineWidth = 1;
    ctx.strokeWidth = 1;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "#555";
    ctx.strokeRect(0, size / 2, size, 0);
    ctx.strokeRect(size / 2, 0, 0, size);
    ctx.strokeRect(0, 0, size, size);

    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(inputX.get() * size, inputY.get() * size, 5, 0, Math.PI * 2, true);
    ctx.stroke();
}

function setDefaultValues()
{
    // const hex = getInputColorHex();
    defaultValuePortY.set(inputY.get());
    defaultValuePortX.set(inputX.get());

    setOutValue(defaultValuePortX.get(), defaultValuePortY.get());

    // defaultValuePort.set(hex);
    // outHex.set(hex);

    redraw();
    op.refreshParams();
}

function inputColorChanged()
{
    redraw();
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;

    op.setUiAttrib({ "extendTitle": labelText });
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else if (el.parentElement) el.parentElement.removeChild(el);
}

function showElement(el)
{
    if (el) el.style.display = "block";
}

function hideElement(el)
{
    if (el) el.style.display = "none";
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}
