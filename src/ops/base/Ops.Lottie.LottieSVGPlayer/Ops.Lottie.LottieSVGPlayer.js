const
    inEle = op.inObject("HTML Element"),
    inData = op.inObject("JSON Data"),
    inPlayMode = op.inSwitch("Play Mode", ["Auto", "Frame"], "Auto"),

    inPlay = op.inValueBool("Play", true),
    inFrame = op.inFloat("Render Frame", 0),

    inLoop = op.inValueBool("Loop", true),
    inDir = op.inBool("Play Backward"),
    inRewind = op.inTriggerButton("Rewind"),

    outComplete = op.outBool("Completed", false),
    outProgress = op.outNumber("Progress");
    // anim.setDirection(-1) ;

inPlay.onChange = play;
inLoop.onChange = inEle.onChange = inData.onChange = updateData;

let anim = null;

inFrame.onChange = gotoFrame;
inDir.onChange = updateDir;
inRewind.onTriggered = updateData;

inPlayMode.onChange = updateUi;

let playmodeAuto = true;

function updateUi()
{
    playmodeAuto = inPlayMode.get() === "Auto";

    inPlay.setUiAttribs({ "greyout": !playmodeAuto });
    inFrame.setUiAttribs({ "greyout": playmodeAuto });
    if (playmodeAuto) play();
    else gotoFrame();
}

function dispose()
{
    if (anim)
    {
        anim.destroy();
        anim = null;
    }
}

function play()
{
    if (!anim) return;
    outComplete.set(false);
    if (!inPlay.get())anim.pause();
    else anim.play();
}

function gotoFrame()
{
    if (playmodeAuto) return;
    anim.goToAndStop(inFrame.get(), false);
}

function updateDir()
{
    if (!anim) return;
    if (!inDir.get()) anim.setDirection(1);
    else anim.setDirection(-1);

    if (inPlay.get()) play();
}

function updateData()
{
    if (anim)dispose();
    if (!inEle.get() || !inData.get()) return;

    if (Object.keys(inData.get()).length == 0) return;

    const params = {
        "container": inEle.get(),
        "renderer": "svg",
        "loop": inLoop.get() == true,
        "autoplay": inPlay.get() == true,
        "animationData": inData.get()
    };

    anim = lottie.loadAnimation(params);
    anim.addEventListener("complete", () =>
    {
        outComplete.set(true);
    });

    anim.addEventListener("enterFrame", (e) =>
    {
        outProgress.set(e.currentTime / (e.totalTime - 1));
    });

    updateDir();
}
