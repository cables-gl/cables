const
    // src=op.inString("URL",'https://undev.studio'),
    src = op.inUrl("File"),
    elId = op.inString("ID"),
    controls = op.inBool("Controls", true),
    active = op.inBool("Active", true),
    inStyle = op.inStringEditor("Style", "position:absolute;\nz-index:9999;\nborder:0;\nwidth:50%;\nheight:50%;"),
    outEle = op.outObject("Element"),
    outPlaying = op.outBool("Playing"),
    outCanplaythrough = op.outBool("canplaythrough");

op.setPortGroup("Attributes", [src, elId]);

let element = null;
let timeOut = null;

op.onDelete = removeEle;

op.onLoaded = init;

function init()
{
    console.log("INIT VIDEOELEMENT!!!!!!!!!!");
    addElement();
    updateSoon();

    inStyle.onChange =
    src.onChange =
    elId.onChange = updateSoon;

    active.onChange = updateActive;
}
init();

controls.onChange = updateControls;

function updateControls()
{
    if (controls.get()) element.controls = "true";
    else element.removeAttribute("controls");
}

function addElement()
{
    if (!active.get()) return;
    if (element) removeEle();
    element = document.createElement("video");
    element.setAttribute("playsinline", "");
    element.setAttribute("webkit-playsinline", "");
    element.preload = "true";
    updateControls();
    element.setAttribute("crossOrigin", "anonymous");
    outCanplaythrough.set(false);

    element.addEventListener("canplaythrough", () =>
    {
        outCanplaythrough.set(true);
    }, true);
    element.addEventListener("play", () =>
    {
        outPlaying.set(true);
    }, true);
    element.addEventListener("pause", () =>
    {
        outPlaying.set(false);
    }, true);

    // element.playbackRate = speed.get();
    // if (!addedListeners)
    // {
    //     addedListeners = true;
    //     element.addEventListener("canplaythrough", initVideo, true);
    //     element.addEventListener("loadedmetadata", loadedMetaData);
    //     element.addEventListener("playing", function () { videoElementPlaying = true; }, true);
    // }

    updateAttribs();
    const parent = op.patch.cgl.canvas.parentElement;
    parent.appendChild(element);
    outEle.set(element);
}

function updateSoon()
{
    clearTimeout(timeOut);
    timeOut = setTimeout(updateAttribs, 30);
}

function updateAttribs()
{
    if (!element) return;
    element.setAttribute("style", inStyle.get());
    element.setAttribute("src", src.get());
    element.setAttribute("id", elId.get());
}

function removeEle()
{
    if (element && element.parentNode)element.parentNode.removeChild(element);
    element = null;
    outEle.set(element);
}

function updateActive()
{
    if (!active.get())
    {
        removeEle();
        return;
    }

    addElement();
}
