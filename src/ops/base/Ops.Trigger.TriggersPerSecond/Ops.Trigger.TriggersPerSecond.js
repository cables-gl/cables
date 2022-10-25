const
    exe = op.inTrigger("exe"),
    cps = op.outNumber("cps");

let timeStart = 0;
let cpsCount = 0;

exe.onTriggered = function ()
{
    if (timeStart === 0)timeStart = CABLES.now();
    let now = CABLES.now();

    if (now - timeStart > 1000)
    {
        timeStart = CABLES.now();
        op.setUiAttrib({ "extendTitle": cpsCount });
        cps.set(cpsCount);
        cpsCount = 0;
    }

    cpsCount++;
};
