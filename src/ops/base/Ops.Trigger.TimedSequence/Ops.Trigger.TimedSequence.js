const exe = op.inTrigger("exe");
const current = op.inValueInt("current", 0);
const overwriteTime = op.inValueBool("overwriteTime");
const ignoreInSubPatch = op.inValueBool("ignoreInSubPatch", false);
const triggerAlways = op.outTrigger("triggerAlways");
const outNames = op.outArray("Names", []);
const currentKeyTime = op.outNumber("currentKeyTime");
const outCurrent = op.outNumber("Current");
let triggers = [];

for (let i = 0; i < 32; i++)
{
    let p = op.outTrigger("trigger " + i);
    p.onLinkChanged = updateNames;
    triggers.push(p);
}

function updateNames()
{
    let names = [];
    for (let i = 0; i < triggers.length; i++)
        if (triggers[i].isLinked()) names.push(triggers[i].links[0].getOtherPort(triggers[i]).op.uiAttribs.title);
        else names.push("none");

    outNames.set(names);
}

op.onLoaded = updateNames;

// let lastUiValue = -1;

exe.onTriggered = doTrigger;

function doTrigger(_time)
{
    let spl = 0;

    let outIndex = Math.round(current.get() - 0.5);

    // if (window.gui)
    // {
    // if (current.get() != lastUiValue)
    // {
    // lastUiValue = current.get();
    // for (spl = 0; spl < triggers.length; spl++)
    // {
    // if (spl == lastUiValue) triggers[spl].setUiActiveState(true);
    // else triggers[spl].setUiActiveState(false);
    // }
    // }
    // }

    if (current.anim)
    {
        let time = _time;
        if (_time === undefined) time = current.op.patch.timer.getTime();
        let key = current.anim.getKey(time);

        let timeOff = 0;
        if (key) timeOff = key.time;

        currentKeyTime.set(time - timeOff);

        if (current.isAnimated())
        {
            if (overwriteTime.get())
            {
                current.op.patch.timer.overwriteTime = currentKeyTime.get(); // todo  why current ? why  not self ?
            }
        }
    }

    if (op.patch.gui && ignoreInSubPatch.get())
    {
        for (let i = 0; i < triggers.length; i++)
        {
            for (spl = 0; spl < triggers[i].links.length; spl++)
            {
                if (triggers[i].links[spl])
                {
                    if (triggers[i].links[spl].portIn.op.patchId)
                    {
                        if (CABLES.UI)
                            if (gui.patchView.getCurrentSubPatch() == triggers[i].links[spl].portIn.op.patchId.get())
                            {
                                op.patch.timer.overwriteTime = -1;

                                triggers[i].trigger();
                                return;
                            }
                    }
                }
            }
        }
    }

    if (outIndex >= 0 && outIndex < triggers.length)
    {
        outCurrent.set(outIndex);
        triggers[outIndex].trigger();
    }

    op.patch.timer.overwriteTime = -1;
    triggerAlways.trigger();
}
