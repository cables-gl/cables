const
    inMax = op.inFloat("Length", 30),
    inCurrent = op.inFloat("Current", 0),
    inClamp = op.inBool("Clamp", false),
    inIsPlaying = op.inBool("Is Playing", false),
    inVisible = op.inBool("Visible", true),
    inShowValue = op.inBool("Show Time"),
    inShowSkip = op.inBool("Show Skip Buttons"),

    outPlay = op.outTrigger("Play clicked"),
    outPause = op.outTrigger("Pause clicked"),
    outRewind = op.outTrigger("Rewind clicked"),
    outBack = op.outTrigger("Skip Back clicked"),
    outForward = op.outTrigger("Skip Forward clicked"),

    outDragged = op.outTrigger("Dragged"),
    outValue = op.outNumber("Current Value"),
    outDragging = op.outBoolNum("Dragging", false),
    outElement = op.outObject("DOM Element", null, "element");

let div = op.patch.getDocument().createElement("div");
div.id = "progressUI_" + op.id;
div.classList.add("progressUI");
outElement.set(div);

const cgl = op.patch.cgl;
let canvas = op.patch.cgl.canvas.parentElement;
canvas.appendChild(div);

let progressContainer = op.patch.getDocument().createElement("div");
if (!inVisible.get())
{
    div.style.display = "none";
}
let progressbar = op.patch.getDocument().createElement("input");
let progress = op.patch.getDocument().createElement("div");
const buttonContainer = op.patch.getDocument().createElement("div");

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

const styleEle = op.patch.getDocument().createElement("style");
styleEle.type = "text/css";
styleEle.id = eleId;
styleEle.classList.add("cablesEle");

let head = op.patch.getDocument().getElementsByTagName("body")[0];
head.appendChild(styleEle);

buttonContainer.classList.add("buttonContainer");

let skipbackbutton = addButton("", "progressUI_icon-skip-back");
buttonContainer.appendChild(skipbackbutton);

let rewindButton = addButton("", "progressUI_icon-rewind", "skip");
if (!inShowSkip.get())
{
    rewindButton.style.display = "none";
}
buttonContainer.appendChild(rewindButton);
rewindButton.addEventListener("pointerdown", () =>
{
    outBack.trigger();
});

let playButton = addButton("", "progressUI_icon-play");
buttonContainer.appendChild(playButton);

let forwardButton = addButton("", "progressUI_icon-fast-forward", "skip");
if (!inShowSkip.get())
{
    forwardButton.style.display = "none";
}
buttonContainer.appendChild(forwardButton);

forwardButton.addEventListener("pointerdown", () =>
{
    outForward.trigger();
});

progress.classList.add("progress");
progress.innerHTML = "00:00:000";

function addButton(title, icon, additionalClass)
{
    let button = op.patch.getDocument().createElement("div");
    button.classList.add("button");
    button.classList.add(additionalClass);
    button.innerHTML = title;

    if (icon)
    {
        let buttonicon = op.patch.getDocument().createElement("div");
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

inVisible.onChange = () =>
{
    if (inVisible.get())
    {
        div.style.removeProperty("display");
    }
    else
    {
        div.style.display = "none";
    }
};

inShowValue.onChange = () =>
{
    if (inShowValue.get())
    {
        div.classList.add("showValue");
        progress.style.display = "block";
    }
    else
    {
        div.classList.remove("showValue");
        progress.style.display = "none";
    }
};

inShowSkip.onChange = () =>
{
    if (inShowSkip.get())
    {
        div.querySelectorAll(".button.skip").forEach((skip) =>
        {
            skip.style.display = "block";
        });
    }
    else
    {
        div.querySelectorAll(".button.skip").forEach((skip) =>
        {
            skip.style.display = "none";
        });
    }
};

if (!inShowValue.get())
{
    progress.style.display = "none";
}
progressbar.addEventListener("pointerdown", () =>
{
    isDragging = true;
    if (inIsPlaying.get())
    {
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
        outDragging.set(isDragging);
        updateProgressDisplay(currentProgress);
        outValue.set(currentProgress);
        outDragged.trigger();
    }
});

progressbar.addEventListener("pointerup", () =>
{
    const currentProgress = progressbar.value;
    updateProgressDisplay(currentProgress);
    outValue.set(currentProgress);

    if (isDragging)
    {
        outDragged.trigger();
    }

    isDragging = false;
    outDragging.set(isDragging);
    if (wasPlaying)
    {
        wasPlaying = false;
        outPlay.trigger();
        updatePlayButton();
    }
});

function updateStyle()
{
    styleEle.textContent = attachments.css_progressui_css;
}

function updatePlayButton()
{
    playButton.querySelector(".progressUIIcon").classList.remove("progressUI_icon-play");
    playButton.querySelector(".progressUIIcon").classList.remove("progressUI_icon-pause");
    if (inIsPlaying.get())
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
    if (inIsPlaying.get())
    {
        outPause.trigger();
    }
    else
    {
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
function updateProgressDisplay(currentValue = null)
{
    let displayValue = currentValue || inCurrent.get();
    let t = displayValue;
    if (t != lasttime)
    {
        progress.innerHTML = formatValue(t);
        lasttime = t;
    }
}

function formatValue(t)
{
    const minutes = String(new Date(t * 1000).getUTCMinutes()).padStart(2, "0");
    const seconds = String(new Date(t * 1000).getUTCSeconds()).padStart(2, "0");
    const millis = String(new Date(t * 1000).getUTCMilliseconds()).padStart(2, "0").padEnd(3, "0");
    const html = minutes + ":" + seconds + ":" + millis;
    return html;
}

updateStyle();
updatePlayButton();

inCurrent.onChange = currentValueChange;
inIsPlaying.onChange = updatePlayButton;
