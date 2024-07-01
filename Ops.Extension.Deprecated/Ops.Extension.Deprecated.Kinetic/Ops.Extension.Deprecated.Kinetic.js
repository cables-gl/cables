let value = op.inValue("Value", 0);
let result = op.outValue("Result");

let firstTime = true;
let smoothInterval = 0;

let anim = new CABLES.Anim();
anim.defaultEasing = CABLES.EASING_EXPO_OUT;

function updateSmooth()
{
    let v = anim.getValue(op.patch.freeTimer.get());

    if (v == value.get()) clearInterval(smoothInterval);

    if (v != v)v = 0;
    result.set(v);
}

value.onChange = function ()
{
    clearInterval(smoothInterval);
    smoothInterval = setInterval(updateSmooth, 15);

    if (firstTime)
    {
        anim.clear();
        anim.setValue(op.patch.freeTimer.get(), value.get());
        firstTime = false;
        return;
    }

    anim.clear();
    anim.setValue(op.patch.freeTimer.get(), (result.get() * 0.7 + value.get() * 0.3));

    let dist = Math.abs(result.get() - value.get());
    let duration = (dist * 1 / dist) + 0.0001;
    anim.setValue(op.patch.freeTimer.get() + duration, value.get());
};
