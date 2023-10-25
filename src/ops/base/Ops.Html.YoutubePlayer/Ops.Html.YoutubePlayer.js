const
    src = op.inString("Video Id", "dQw4w9WgXcQ"),
    active = op.inBool("Active", true),
    inStyle = op.inStringEditor("Style"),
    elId = op.inString("ElementID"),
    paramAutoplay = op.inBool("Autoplay", false),
    paramCC = op.inBool("Display Captions", false),
    paramLoop = op.inBool("Loop", false),
    paramFs = op.inBool("Allow Fullscreen", true),
    paramControls = op.inBool("Hide Controls", false),
    paramStart = op.inInt("Start at Second", 0),

    outEle = op.outObject("Element"),
    outDirectLink = op.outString("Direct Link");
    // outImageMax=op.outString("Thumbnail Max");

const defaultStyle = "position:absolute;\n\
z-index:9;\n\
border:0;\n";

op.setPortGroup("Youtube Options", [paramAutoplay, paramCC, paramLoop, paramFs, paramControls, paramStart]);

// https://developers.google.com/youtube/player_parameters

let element = null;
let initialized = false;

paramStart.onChange =
    paramAutoplay.onChange =
    paramCC.onChange =
    paramLoop.onChange =
    paramFs.onChange =
    paramControls.onChange =
    src.onChange = updateURL;

elId.onChange = updateID;
inStyle.onChange = updateStyle;
op.onDelete = removeEle;

active.onChange = update;

op.init = function ()
{
    initialized = true;
    setTimeout(() => { update(); }, 100);
};

inStyle.set(defaultStyle);

function update()
{
    if (!active.get())
    {
        removeEle();
        return;
    }

    addElement();
}

function addElement()
{
    if (!initialized) return;
    if (element) removeEle();

    const parent = op.patch.cgl.canvas.parentElement;
    element = op.patch.getDocument().createElement("iframe");
    element.dataset.op = op.id;
    element.style.position = "absolute";
    element.allowfullscreen = true;
    element.frameborder = 0;
    element.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";

    parent.appendChild(element);

    updateURL();
    updateID();
    updateStyle();

    outEle.set(null);
    outEle.set(element);
}

function removeEle()
{
    if (element && element.parentNode) element.parentNode.removeChild(element);
    element = null;
    outEle.set(null);
}

function updateURL()
{
    if (src.get()) outDirectLink.set("https://www.youtube.com/watch?v=" + src.get());

    if (!initialized) return;
    if (!active.get()) return;
    const urlParams = [];

    if (paramAutoplay.get()) urlParams.push("autoplay=1");
    if (paramCC.get()) urlParams.push("cc_load_policy=1");
    if (paramLoop.get()) urlParams.push("loop=1");
    if (paramFs.get()) urlParams.push("fs=1");
    if (paramControls.get()) urlParams.push("controls=0");
    if (paramStart.get() > 0) urlParams.push("start=" + paramStart.get());

    let urlParamsStr = "";
    if (urlParams.length > 0) urlParamsStr = "?" + urlParams.join("&") + "&rel=0";

    const urlStr = "https://www.youtube.com/embed/" + src.get() + urlParamsStr;
    if (element)
        element.setAttribute("src", urlStr);
}

function updateID()
{
    if (!active.get()) return;
    if (element) element.setAttribute("id", elId.get());
}

function updateStyle()
{
    if (!active.get()) return;
    if (element) element.style = inStyle.get();
}
