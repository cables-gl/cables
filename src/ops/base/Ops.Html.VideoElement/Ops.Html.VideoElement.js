const
    src = op.inUrl("File", null, ""),
    elId = op.inString("ID"),
    play = op.inBool("Play"),
    inautoplay = op.inBool("Autoplay", false),
    controls = op.inBool("Controls", true),
    active = op.inBool("Active", true),
    loop = op.inBool("Loop", false),
    inMuted = op.inBool("Muted", false),
    inStyle = op.inStringEditor("Style", "position:absolute;\nz-index:9999;\nborder:0;\nwidth:50%;\nheight:50%;"),
    rewind = op.inTriggerButton("Rewind"),
    outEle = op.outObject("Element"),
    outPlaying = op.outBool("Playing"),
    outCanplaythrough = op.outBool("Can Play Through"),
    outTime = op.outNumber("Time"),
    outEnded = op.outTrigger("Ended"),
    outHasError = op.outBool("Has Error"),
    outError = op.outString("Error Message"),
    outWidth = op.outNumber("Video Width"),
    outHeight = op.outNumber("Video Height");

op.setPortGroup("Attributes", [src, elId]);

let element = op.patch.getDocument().createElement("video");
let timeOut = null;

op.onDelete = removeEle;
op.onLoaded = init;

function init()
{
    addElement();
    updateSoon();

    inStyle.onChange =
    src.onChange =
    inautoplay.onChange =
    updateAttribs.onChange =
    elId.onChange = updateSoon;
    active.onChange = updateActive;
}

init();

loop.onChange =
    controls.onChange =
    inMuted.onChange = updateVideoSettings;

function updateVideoSettings()
{
    if (!element) return;
    if (controls.get()) element.controls = "true";
    else
    {
        element.controls = "true";
        element.removeAttribute("controls");
    }

    if (loop.get()) element.loop = "true";
    else element.removeAttribute("loop");

    if (inMuted.get()) element.muted = "true";
    else element.removeAttribute("muted");
}

function updatePlay()
{
    if (!element) return;
    if (play.get())element.play();
    else element.pause();
}

play.onChange = () =>
{
    updatePlay();
};

rewind.onTriggered = function ()
{
    if (element) element.currentTime = 0;
};

function addElement()
{
    if (!active.get()) return;
    if (element) removeEle();
    element = document.createElement("video");
    element.setAttribute("playsinline", "");
    element.setAttribute("webkit-playsinline", "");
    element.preload = "true";
    updateVideoSettings();
    element.setAttribute("crossOrigin", "anonymous");

    outCanplaythrough.set(false);
    outHasError.set(false);
    outError.set("");
    outWidth.set(0);
    outHeight.set(0);

    element.addEventListener("canplaythrough", () =>
    {
        if (!element) return;
        outWidth.set(element.videoWidth);
        outHeight.set(element.videoHeight);
        outCanplaythrough.set(true);
    }, true);

    element.addEventListener("play", () =>
    {
        outPlaying.set(true);
    }, true);

    element.addEventListener("ended", () =>
    {
        outEnded.trigger();
    }, true);

    element.addEventListener("pause", () =>
    {
        outPlaying.set(false);
    }, true);

    element.addEventListener("timeupdate", () =>
    {
        if (element)outTime.set(element.currentTime);
    }, true);

    element.onerror = function ()
    {
        outHasError.set(true);
        if (element && element.error)
        {
            outError.set("Error " + element.error.code + "/" + element.error.message);
            op.log("Error " + element.error.code + "; details: " + element.error.message);
        }
    };

    updateAttribs();
    const parent = op.patch.cgl.canvas.parentElement;
    parent.appendChild(element);

    updateVideoSettings();

    if (play.get())updatePlay();

    outEle.set(element);
}

function updateSoon()
{
    clearTimeout(timeOut);
    timeOut = setTimeout(updateAttribs, 30);
}

function updateAttribs()
{
    if (!element || !src.get()) return;
    element.setAttribute("style", inStyle.get());
    element.setAttribute("src", op.patch.getFilePath(String(src.get())));
    element.setAttribute("id", elId.get());

    if (inautoplay.get())element.setAttribute("autoplay", "");
    else element.removeAttribute("autoplay");
}

function removeEle()
{
    if (element && element.parentNode)element.parentNode.removeChild(element);
    element = null;
    outEle.set(element);
}

function updateActive()
{
    if (!active.get()) removeEle();
    else addElement();
}
