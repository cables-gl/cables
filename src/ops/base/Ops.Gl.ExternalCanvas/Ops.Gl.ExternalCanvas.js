const
    inUpdate = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    inPosX = op.inInt("Pos X", 0),
    inPosY = op.inInt("Pos Y", 0),
    inSizeX = op.inInt("Width", 800),
    inSizeY = op.inInt("Height", 480),
    inSmoothing = op.inBool("Smoothing", true),
    inStretch = op.inBool("Stretch", false),
    inTitle = op.inString("Title", "cables"),
    inOpen = op.inTriggerButton("Open Window"),
    inFull = op.inTriggerButton("Fullscreen"),
    outEle = op.outObject("Element", null, "element"),
    inClose = op.inTriggerButton("Close");

let canvas = null;
let ctx = null;
let winWidth = 400, winHeight = 400;
let origWidth, origHeight;
let subWindow = null;
let x = 0;
let y = 0;

op.toWorkPortsNeedToBeLinked(inUpdate, next);
op.setPortGroup("Size", [inSizeX, inSizeY]);
op.setPortGroup("Position", [inPosY, inPosX]);

inClose.onTriggered = close;
op.onDelete = close;
window.addEventListener("beforeunload", close, false);

if (CABLES.UI)gui.on("resizecanvas", () => { resize(); setTimeout(resize, 150); });

inStretch.onChange = resize;

inPosY.onChange =
    inPosX.onChange = move;

inSizeY.onChange =
    inSizeX.onChange = onSize;

function onSize()
{
    if (subWindow) subWindow.resizeTo(inSizeX.get(), inSizeY.get());
    resize();
}

function move()
{
    if (!subWindow) return;
    subWindow.moveTo(inPosX.get(), inPosY.get());
}

inTitle.onChange = () =>
{
    if (subWindow)subWindow.document.title = inTitle.get();
};

inUpdate.onTriggered = () =>
{
    next.trigger();

    if (canvas && ctx)
    {
        canvas.style.top = y + "px";
        canvas.style.left = x + "px";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = inSmoothing.get();

        if (op.patch.cgCanvas) ctx.drawImage(op.patch.cgCanvas.canvasEle, 0, 0, canvas.width, canvas.height);
        else ctx.drawImage(op.patch.cgl.canvas, 0, 0, canvas.width, canvas.height);
    }
};

function close()
{
    if (subWindow)subWindow.close();

    subWindow = null;
    canvas = null;
    ctx = null;
}

function resize(useWinSize)
{
    if (!subWindow) return;

    origWidth = op.patch.cgl.canvasWidth;
    origHeight = op.patch.cgl.canvasHeight;

    winWidth = subWindow.innerWidth;
    winHeight = subWindow.innerHeight;

    x = 0;
    y = 0;

    if (inStretch.get())
    {
        canvas.width = winWidth;
        canvas.height = winHeight;
    }
    else
    {
        if (winWidth / winHeight < origWidth / origHeight)
        {
            canvas.width = winWidth;
            canvas.height = canvas.width * (origHeight / origWidth);
            y = Math.abs(winHeight - canvas.height) / 2;
        }
        else
        {
            canvas.height = winHeight;
            canvas.width = canvas.height / (origHeight / origWidth);
            x = Math.abs(winWidth - canvas.width) / 2;
        }
    }
}

function fullscreen()
{
    if (!subWindow) return;
    const elem = subWindow.document.body;
    if (elem.requestFullScreen) elem.requestFullScreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullScreen)elem.webkitRequestFullScreen();
    else if (elem.msRequestFullScreen)elem.msRequestFullScreen();

    resize();
}

inOpen.onTriggered = () =>
{
    if (subWindow)close();
    let id = CABLES.uuid();
    subWindow = window.open("", "view#" + id, "width=" + inSizeX.get() + ",height=" + inSizeY.get() + ",directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=no,resizable=yes,popup=true");
    if (!subWindow) return;
    let document = subWindow.document;
    document.title = inTitle.get();

    let body = document.body;
    body.style = "padding:0px;margin:0px;background-color:#000;overflow:hidden;";
    canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.width = winWidth;
    canvas.height = winHeight;
    body.appendChild(canvas);

    ctx = canvas.getContext("2d");

    outEle.setRef(body);

    resize();
    move();

    subWindow.addEventListener("resize", () =>
    {
        resize();
    });

    subWindow.addEventListener("beforeunload", close, false);

    canvas.addEventListener("dblclick", (e) =>
    {
        fullscreen();
    });
};
