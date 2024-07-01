let exe = op.inTrigger("exe");
let beat = op.inTriggerButton("beat");
let bang = op.outValue("bang");

let startValue = op.inValueFloat("startValue");
let endValue = op.inValueFloat("endValue");
let duration = 0;
let bpm = op.inValueFloat("bpm");

let anim = new CABLES.Anim();

let easing = op.inValueSelect("easing", ["linear", "smoothstep", "smootherstep"], "linear");

function init()
{
    if (easing.get() == "linear") anim.defaultEasing = CABLES.EASING_LINEAR;
    if (easing.get() == "smoothstep") anim.defaultEasing = CABLES.EASING_SMOOTHSTEP;
    if (easing.get() == "smootherstep") anim.defaultEasing = CABLES.EASING_SMOOTHERSTEP;

    anim.clear();

    if (bpm === 0)
    {
        anim.setValue(parseFloat(1000 + op.patch.freeTimer.get()), endValue.get());
    }
    else
    {
        duration = 4 / (bpm.get() / 60); // duration of one beat in seconds
        anim.setValue(op.patch.freeTimer.get(), startValue.get());
        anim.setValue(parseFloat(duration + op.patch.freeTimer.get()), endValue.get());
    }
}

beat.onTriggered = function ()
{
    let t = op.patch.freeTimer.get();
    let v = anim.getValue(t);
    init();
};

let redoAnimtion = true;

exe.onTriggered = function ()
{
    // if there is no beat, don't bang
    if (bpm.get() === 0)
    {
        bang.set(endValue.get());
    }

    let t = op.patch.freeTimer.get();
    let v = anim.getValue(t);

    bang.set(v);
};

startValue.set(1.0);
endValue.set(0.0);
bpm.set(0);
init();

startValue.onChange = init;
endValue.onChange = init;
bpm.onChange = init;
easing.onChange = init;
