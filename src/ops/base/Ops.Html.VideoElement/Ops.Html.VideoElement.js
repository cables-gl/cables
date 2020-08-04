const
    // src=op.inString("URL",'https://undev.studio'),
    src = op.inUrl("File"),
    elId = op.inString("ID"),
    play = op.inBool("Play"),
    controls = op.inBool("Controls", true),
    active = op.inBool("Active", true),
    loop = op.inBool("Loop", false),
    inStyle = op.inStringEditor("Style", "position:absolute;\nz-index:9999;\nborder:0;\nwidth:50%;\nheight:50%;"),
    rewind = op.inTriggerButton("Rewind"),
    outEle = op.outObject("Element"),
    outPlaying = op.outBool("Playing"),
    outCanplaythrough = op.outBool("Can Play Through"),
    outTime = op.outNumber("Time");


op.setPortGroup("Attributes", [src, elId]);

let element = null;
let timeOut = null;

op.onDelete = removeEle;

op.onLoaded = init;

function init()
{
    addElement();
    updateSoon();

    inStyle.onChange =
    src.onChange =
    elId.onChange = updateSoon;

    active.onChange = updateActive;
}
init();

loop.onChange =
controls.onChange = updateVideoSettings;

function updateVideoSettings()
{
    if (controls.get()) element.controls = "true";
    else element.removeAttribute("controls");

    if (loop.get()) element.loop = "true";
    else element.removeAttribute("loop");
}

play.onChange = () =>
{
    if (!element) return;
    if (play.get())element.play();
    else element.pause();
};

rewind.onTriggered = function ()
{
    element.currentTime = 0;
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

    element.addEventListener("timeupdate", () =>
    {
        outTime.set(element.currentTime);
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
