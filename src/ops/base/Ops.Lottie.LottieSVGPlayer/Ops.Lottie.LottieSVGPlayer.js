const
    inEle = op.inObject("HTML Element"),
    inData = op.inObject("JSON Data"),
    inPlay = op.inValueBool("Play", true),
    inLoop = op.inValueBool("Loop", true);

inPlay.onChange = inLoop.onChange = inEle.onChange = inData.onChange = updateData;

let anim = null;

function dispose()
{
    if (anim)
    {
        anim.destroy();
        anim = null;
    }
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
}
