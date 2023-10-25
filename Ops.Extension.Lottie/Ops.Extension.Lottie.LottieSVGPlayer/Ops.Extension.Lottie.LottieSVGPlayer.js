const
    inEle = op.inObject("HTML Element"),
    inData = op.inObject("JSON Data"),
    inPlayMode = op.inSwitch("Play Mode", ["Auto", "Frame"], "Auto"),

    inFrame = op.inFloat("Render Frame", 0),
    inLoop = op.inValueBool("Loop", true),

    inPlay = op.inValueBool("Play", true),

    inDir = op.inBool("Play Backward"),
    inRewind = op.inTriggerButton("Rewind"),
    inEnabled=op.inBool("Active",true),

    outComplete = op.outBool("Completed", false),
    outProgress = op.outNumber("Progress"),
    outTotalFrames = op.outNumber("Total Frames");

op.setPortGroup("Timing", [inLoop, inPlayMode, inFrame, inPlay, inRewind, inDir]);

let anim = null;
let playmodeAuto = true;

inPlay.onChange = play;

let timeout=null;

inEnabled.onChange=
    inRewind.onTriggered =
    inLoop.onChange =
    inEle.onChange =
    inData.onChange = ()=>
    {
        clearTimeout(timeout);
        timeout=setTimeout(()=>{timeout=null;updateData();},30);
        //if(!timeout)
    };

inFrame.onChange = gotoFrame;
inDir.onChange = updateDir;
inPlayMode.onChange = updateUi;
updateUi();

function updateUi()
{
    playmodeAuto = inPlayMode.get() === "Auto";

    inPlay.setUiAttribs({ "greyout": !playmodeAuto });
    inDir.setUiAttribs({ "greyout": !playmodeAuto });
    inRewind.setUiAttribs({ "greyout": !playmodeAuto });
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
        outTotalFrames.set(0);
    }
}

function play()
{
    if (!anim) return;
    if (!playmodeAuto) return gotoFrame();

    outComplete.set(false);
    if (!inPlay.get())anim.pause();
    else anim.play();
}

function gotoFrame()
{
    if (playmodeAuto) return;
    if (!anim) return;

    let fr = inFrame.get();
    if (inLoop.get())fr %= anim.totalFrames;

    anim.goToAndStop(fr, true);
}

function updateDir()
{
    if (!anim) return;
    if (!inDir.get()) anim.setDirection(1);
    else anim.setDirection(-1);

    if (inPlay.get() && playmodeAuto) play();
}

function updateData()
{
    if (anim)dispose();
    if (!inEle.get() || !inData.get()) return;
    if (Object.keys(inData.get()).length === 0) return;

    updateUi();

let data=null;
if(inEnabled.get())data=inData.get();//JSON.parse(JSON.stringify(inData.get())); // deep copy every time ? https://github.com/airbnb/lottie-web/issues/1159
else return anim=null;

    const params = {
        "container": inEle.get(),
        "renderer": "svg",
        "loop": inLoop.get() == true,
        "autoplay": (inPlay.get() == true && playmodeAuto),
        "animationData": data
    };

    anim = lottie.loadAnimation(params);
    console.log("new lottie anim...")

    anim.addEventListener("complete", () =>
    {
        outComplete.set(true);
    });

    anim.addEventListener("enterFrame", (e) =>
    {
        outProgress.set(e.currentTime / (e.totalTime - 1));
    });
    outTotalFrames.set(anim.totalFrames);
    updateDir();
    gotoFrame();
}
