// var text=op.addInPort(new CABLES.Port(op,"Text",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
let text = op.addInPort(new CABLES.Port(op, "Text", CABLES.OP_PORT_TYPE_VALUE, { "type": "string", "display": "editor" }));

let id = op.addInPort(new CABLES.Port(op, "Id", CABLES.OP_PORT_TYPE_VALUE, { "type": "string" }));
// var classes=op.addInPort(new CABLES.Port(op,"Class",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
let classes = op.inValueString("Class");

let visible = op.addInPort(new CABLES.Port(op, "Visible", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
visible.set(true);

let doCenterX = op.inValueBool("Center X", false);
let doCenterY = op.inValueBool("Center Y", false);

let posLeft = op.addInPort(new CABLES.Port(op, "Left", CABLES.OP_PORT_TYPE_VALUE));
let posTop = op.addInPort(new CABLES.Port(op, "Top", CABLES.OP_PORT_TYPE_VALUE));

let borderRadius = op.addInPort(new CABLES.Port(op, "Border radius", CABLES.OP_PORT_TYPE_VALUE));
let fontSize = op.addInPort(new CABLES.Port(op, "Font size", CABLES.OP_PORT_TYPE_VALUE));
let fontFamily = op.addInPort(new CABLES.Port(op, "Font Family", CABLES.OP_PORT_TYPE_VALUE, { "type": "string" }));

let cursor = op.addInPort(new CABLES.Port(op, "cursor", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["auto", "crosshair", "pointer", "Hand", "move", "n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "text", "wait", "help"] }));

let opacity = op.inValueSlider("Opacity", 1.0);

let r = op.addInPort(new CABLES.Port(op, "Text Red", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "colorPick": "true" }));
let g = op.addInPort(new CABLES.Port(op, "Text Green", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let b = op.addInPort(new CABLES.Port(op, "Text Blue", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let a = op.addInPort(new CABLES.Port(op, "Text Opacity", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));

let bgR = op.addInPort(new CABLES.Port(op, "Background Red", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "colorPick": "true" }));
let bgG = op.addInPort(new CABLES.Port(op, "Background Green", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let bgB = op.addInPort(new CABLES.Port(op, "Background Blue", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let bgA = op.addInPort(new CABLES.Port(op, "Background Opacity", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));

let outElement = op.outObject("Element");

r.set(1);
g.set(1);
b.set(1);
a.set(1);

bgR.set(0.5);
bgG.set(0.5);
bgB.set(0.5);
bgA.set(1);

let ignoreMouse = op.addInPort(new CABLES.Port(op, "Ignore Mouse", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
ignoreMouse.set(false);

let autoSize = op.addInPort(new CABLES.Port(op, "Auto width/height", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
let width = op.addInPort(new CABLES.Port(op, "Width", CABLES.OP_PORT_TYPE_VALUE));
let height = op.addInPort(new CABLES.Port(op, "Height", CABLES.OP_PORT_TYPE_VALUE));

let clickTrigger = op.addOutPort(new CABLES.Port(op, "OnClick", CABLES.OP_PORT_TYPE_FUNCTION));
let mouseOver = op.addOutPort(new CABLES.Port(op, "MouseOver", CABLES.OP_PORT_TYPE_VALUE, { "type": "bool" }));
let clientWidth = op.addOutPort(new CABLES.Port(op, "Client Width", CABLES.OP_PORT_TYPE_VALUE));
let clientHeight = op.addOutPort(new CABLES.Port(op, "Client Height", CABLES.OP_PORT_TYPE_VALUE));

text.set("This is a HTML element");
width.set(100);
height.set(30);
fontSize.set(12);
fontFamily.set("Arial");
autoSize.set(true);
autoSize.set(true);

mouseOver.set(false);
let element = null;

text.onChange = updateText;

classes.onChange = updateClasses;
updateText();

width.onChange = updateSize;
height.onChange = updateSize;
autoSize.onChange = updateSize;
posLeft.onChange = updatePos;
posTop.onChange = updatePos;
doCenterX.onChange = updatePos;
doCenterY.onChange = updatePos;

bgR.onChange = updateBgColor;
bgG.onChange = updateBgColor;
bgB.onChange = updateBgColor;
bgA.onChange = updateBgColor;

r.onChange = updateColor;
g.onChange = updateColor;
b.onChange = updateColor;
a.onChange = updateColor;

opacity.onChange = updateOpacity;

fontSize.onChange = updateFont;
fontFamily.onChange = updateFont;
borderRadius.onChange = updateBorder;
cursor.onChange = updateCursor;
ignoreMouse.onChange = updateIgnoreMouse;
init();

visible.onChange = function ()
{
    if (visible.get()) element.style.display = "block";
    else element.style.display = "none";
};

function updateClientSize()
{
    clientWidth.set(element.clientWidth);
    clientHeight.set(element.clientHeight);
}

function updateSize()
{
    if (!element) return;
    if (!autoSize.get())
    {
        element.style.width = width.get() + "px";
        element.style.height = height.get() + "px";
    }
    else
    {
        element.style.height = "auto";
        element.style.width = "auto";
    }
    updateClientSize();
}

function updateFont()
{
    if (!element) return;
    element.style["font-size"] = fontSize.get() + "px";
    element.style["font-family"] = fontFamily.get();
    updateClientSize();
}

function updateBorder()
{
    if (!element) return;
    element.style["border-radius"] = borderRadius.get() + "px";
}

function updateBgColor()
{
    if (!element) return;
    element.style["background-color"] = "rgba(" + Math.round(bgR.get() * 255) + "," + Math.round(bgG.get() * 255) + "," + Math.round(bgB.get() * 255) + "," + (bgA.get()) + ")";
}

function updateOpacity()
{
    if (!element) return;
    element.style.opacity = opacity.get();
}

function updateColor()
{
    if (!element) return;
    element.style.color = "rgba(" + Math.round(r.get() * 255) + "," + Math.round(g.get() * 255) + "," + Math.round(b.get() * 255) + "," + (a.get()) + ")";
}

function updatePos()
{
    if (!element) return;
    let l = posLeft.get();
    let t = posTop.get();
    if (doCenterX.get()) l -= element.clientWidth / 2;
    if (doCenterY.get()) t -= element.clientHeight / 2;

    element.style["margin-left"] = l + "px";
    element.style["margin-top"] = t + "px";
    updateClientSize();
}

function updateCursor()
{
    if (!element) return;
    element.style.cursor = cursor.get();
}

function updateIgnoreMouse()
{
    if (ignoreMouse.get()) element.style["pointer-events"] = "none";
    else element.style["pointer-events"] = "default";
}

function updateText()
{
    if (!element) return;
    let str = String(text.get() || "").replace(/(?:\r\n|\r|\n)/g, "<br />");

    element.innerHTML = str;
    updateClientSize();
}

id.onChange = function ()
{
    element.id = id.get();
};

function updateClasses()
{
    if (element)
    {
        element.className = classes.get();
    }
}

function init()
{
    element = document.createElement("div");
    outElement.set(element);
    element.style.padding = "10px";
    element.style.position = "absolute";
    element.style.overflow = "hidden";
    element.style["z-index"] = "9999";

    // element.style["background-color"]="#f00";

    // var canvas = document.getElementById("cablescanvas") || document.body;
    let canvas = op.patch.cgl.canvas.parentElement;
    canvas.appendChild(element);

    updateSize();
    updatePos();
    updateBgColor();
    updateColor();
    updateBorder();
    updateFont();
    updateClientSize();
    updateCursor();
    updateIgnoreMouse();
    updateOpacity();

    element.onclick = function (e)
    {
        clickTrigger.trigger();
        e.preventDefault();
    };

    element.ontouchstart = function (e)
    {
        clickTrigger.trigger();
        e.preventDefault();
    };

    element.onmouseover = function ()
    {
        mouseOver.set(true);
    };

    element.onmouseleave = function ()
    {
        mouseOver.set(false);
    };

    updateText();
    updateClasses();
}

op.onDelete = function ()
{
    element.remove();
};
