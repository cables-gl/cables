const inMax = op.inFloat("Length", 1);
const inCurrent = op.inFloat("Current", 0);
const inClamp = op.inBool("Clamp", false);
const inShowValue = op.inBool("Show Time");

const outPlay = op.outTrigger("Play clicked");
const outPause = op.outTrigger("Pause clicked");
const outRewind = op.outTrigger("Rewind clicked");
const outBack = op.outTrigger("Skip Back clicked");
const outForward = op.outTrigger("Skip Forward clicked");

const outValue = op.outNumber("Current Value");
const outElement = op.outObject("DOM Element", null, "element");

let div = document.createElement("div");
div.id = "progressUI_" + op.id;
div.classList.add("progressUI");
outElement.set(div);

const cgl = op.patch.cgl;
let canvas = op.patch.cgl.canvas.parentElement;
canvas.appendChild(div);

let progressContainer = document.createElement("div");
let progressbar = document.createElement("input");
let progress = document.createElement("div");
const buttonContainer = document.createElement("div");

progressContainer.classList.add("progressContainer");

progressContainer.appendChild(progressbar);

progressbar.setAttribute("type", "range");
progressbar.setAttribute("step", 0.01);
progressbar.setAttribute("min", 0);
progressbar.setAttribute("max", inMax.get());
progressbar.setAttribute("value", inCurrent.get());
progressbar.classList.add("progressbar");
progressbar.addEventListener("input", handleInput);
let wasPlaying = false;
let isDragging = false;

div.appendChild(buttonContainer);
div.appendChild(progressContainer);
div.appendChild(progress);

let eleId = "css_progressui_" + CABLES.uuid();

const styleEle = document.createElement("style");
styleEle.type = "text/css";
styleEle.id = eleId;

let head = document.getElementsByTagName("body")[0];
head.appendChild(styleEle);

buttonContainer.classList.add("buttonContainer");

let skipbackbutton = addButton("", "progressUI_icon-skip-back");
buttonContainer.appendChild(skipbackbutton);

let rewindButton = addButton("", "progressUI_icon-rewind");
buttonContainer.appendChild(rewindButton);
rewindButton.addEventListener("pointerdown", () =>
{
    outBack.trigger();
});

let playButton = addButton("", "progressUI_icon-play");
buttonContainer.appendChild(playButton);

let forwardButton = addButton("", "progressUI_icon-fast-forward");
buttonContainer.appendChild(forwardButton);

forwardButton.addEventListener("pointerdown", () =>
{
    outForward.trigger();
});

progress.classList.add("progress");
progress.innerHTML = "00:00:000";

function addButton(title, icon)
{
    let button = document.createElement("div");
    button.classList.add("button");
    button.innerHTML = title;

    if (icon)
    {
        let buttonicon = document.createElement("div");
        buttonicon.classList.add("progressUIIcon");
        buttonicon.classList.add(icon);
        button.appendChild(buttonicon);
    }
    return button;
}

inMax.onChange = () =>
{
    progressbar.setAttribute("max", inMax.get());
};

inShowValue.onChange = () =>
{
    if (inShowValue.get())
    {
        progress.style.display = "block";
    }
    else
    {
        progress.style.display = "none";
    }
};

if (!inShowValue.get())
{
    progress.style.display = "none";
}
progressbar.addEventListener("pointerdown", () =>
{
    isDragging = true;
    if (isPlaying)
    {
        isPlaying = false;
        wasPlaying = true;
        outPause.trigger();
        updatePlayButton();
    }
});
progressbar.addEventListener("pointermove", () =>
{
    const currentProgress = progressbar.value;
    if (isDragging)
    {
        updateProgressDisplay();
        outValue.set(currentProgress);
    }
});

progressbar.addEventListener("pointerup", () =>
{
    isDragging = false;
    if (wasPlaying)
    {
        isPlaying = true;
        wasPlaying = false;
        outPlay.trigger();
        updatePlayButton();
    }
});

function updateStyle()
{
    styleEle.textContent = attachments.css_progressui_css;
}

let isPlaying = false;
function updatePlayButton()
{
    playButton.querySelector(".progressUIIcon").classList.remove("progressUI_icon-play");
    playButton.querySelector(".progressUIIcon").classList.remove("progressUI_icon-pause");
    if (isPlaying)
    {
        playButton.querySelector(".progressUIIcon").classList.add("progressUI_icon-pause");
    }
    else
    {
        playButton.querySelector(".progressUIIcon").classList.add("progressUI_icon-play");
    }
}

playButton.addEventListener("pointerdown", function ()
{
    if (isPlaying)
    {
        isPlaying = false;
        outPause.trigger();
    }
    else
    {
        isPlaying = true;
        outPlay.trigger();
    }
    updatePlayButton();
});

skipbackbutton.addEventListener("pointerdown", () =>
{
    outValue.set(0);
    outRewind.trigger();
});

op.onDelete = function ()
{
    if (div) div.remove();
    if (styleEle) styleEle.remove();
};

function handleInput(e)
{
    inCurrent.onChange = null;
    const newValue = e.target.value;
    outValue.set(newValue);
    inCurrent.onChange = currentValueChange;
}

function currentValueChange()
{
    let currentValue = inCurrent.get();
    if (inClamp.get() && currentValue > inMax.get())
    {
        currentValue = inMax.get();
    }
    progressbar.value = currentValue;
    outValue.set(currentValue);
    updateProgressDisplay();
}

let lasttime = 0;
function updateProgressDisplay()
{
    let currentValue = inCurrent.get();
    let t = currentValue;
    if (t != lasttime)
    {
        progress.innerHTML = formatValue(t);
        lasttime = t;
    }
}

function formatValue(t)
{
    // const hours = String(new Date(t * 1000).getUTCHours()).padStart(2, "0");
    const minutes = String(new Date(t * 1000).getUTCMinutes()).padStart(2, "0");
    const seconds = String(new Date(t * 1000).getUTCSeconds()).padStart(2, "0");
    const millis = String(new Date(t * 1000).getUTCMilliseconds()).padStart(2, "0").padEnd(3, "0");
    const html = minutes + ":" + seconds + ":" + millis;
    return html;
}
inCurrent.onChange = currentValueChange;

updateStyle();
updatePlayButton();
