let inTime = op.inValue("Time");
let inStr = op.inValueString("Frames");
let inLoop = op.inValueBool("Loop");
let inRewind = op.inTriggerButton("Rewind");
let outValue = op.outValue("result time");
let outArr = op.outArray("Expanded Frames");
let finished = op.outValue("Finished", false);
let finishedTrigger = op.outTrigger("Finished Trigger");
let outAnimLength = op.outValue("Anim Length");
let outProgress = op.outValue("Progress");

let anim = new CABLES.Anim();
let FPS = 30;

let timeOffset = 0;
inStr.onChange =
inLoop.onChange = parse;

inRewind.onTriggered = function ()
{
    timeOffset = inTime.get();
};

function setupAnim(frames)
{
    anim.clear();
    anim.loop = inLoop.get();

    for (let i = 0; i < frames.length; i++)
    {
        anim.defaultEasing = CABLES.Anim.EASING_ABSOLUTE;
        if (i < frames.length - 1)
        {
            if (frames[i + 1] == frames[i] + 1 || frames[i + 1] == frames[i] - 1)
                anim.defaultEasing = CABLES.Anim.EASING_LINEAR;
        }

        anim.setValue(i / FPS, frames[i] / FPS);
    }
}

function parse()
{
    let str = inStr.get() + "";
    let frames = [];
    let parts = str.split(",");

    for (let i = 0; i < parts.length; i++)
    {
        if (CABLES.isNumeric(parts[i]))
        {
            frames.push(parseInt(parts[i], 10));
        }
        else if (parts[i].indexOf("-") > -1)
        {
            let r = parts[i].split("-");
            r[0] = parseInt(r[0], 10);
            r[1] = parseInt(r[1], 10);

            if (r[1] > r[0])
                for (var j = r[0]; j <= r[1]; j++) frames.push(j);
            else
                for (var j = r[0]; j >= r[1]; j--) frames.push(j);
        }
    }

    outArr.setRef(frames);
    outAnimLength.set(frames.length / FPS);
    setupAnim(frames);
}

inTime.onChange = function ()
{
    let t = inTime.get() - timeOffset;
    outValue.set(anim.getValue(t));

    if (anim.keys.length > 1)
    {
        let l = anim.keys[anim.keys.length - 1].time - anim.keys[0].time;
        let p = (t % l) / (l);
        if (!inLoop.get()) p = Math.min(t / l, 1);
        outProgress.set(p);
    }

    if (anim.hasEnded(t))
    {
        if (!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }
    else
    {
        finished.set(false);
    }
};
