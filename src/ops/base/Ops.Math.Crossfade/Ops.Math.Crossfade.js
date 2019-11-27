const inFade = op.inFloatSlider("Crossfade",0.5);
const inMinOut = op.inFloat("Out Min", 0);
const inMaxOut = op.inFloat("Out Max", 1);
op.setPortGroup("Range",[inMinOut, inMaxOut]);

const anim = new CABLES.Anim();
const inDropdownAnim = anim.createPort(op,"Easing", function() {
    anim.keys[0].setEasing(anim.defaultEasing);
});
anim.setValue(0,0);
anim.setValue(1,1);
op.setPortGroup("Easing",[inDropdownAnim]);

const outA = op.outNumber("A", 0.5);
const outB = op.outNumber("B", 0.5);


function handleMinMaxChange() {
    anim.keys[0].time= anim.keys[0].value = Math.min(inMin.get(),inMax.get());
    anim.keys[1].time= anim.keys[1].value = Math.max(inMin.get(),inMax.get());
}
function handleValueChange() {
    const val = inFade.get();
    const result = anim.getValue(val);
    outA.set(inMaxOut.get() - result);
    outB.set(result);
}

function updateMinMax()
{
    anim.keys[0].time=anim.keys[0].value=Math.min(inMin.get(),inMax.get());
    anim.keys[1].time=anim.keys[1].value=Math.max(inMin.get(),inMax.get());
}

inMinOut.onChange = inMaxOut.onChange = handleMinMaxChange;
inFade.onChange = handleValueChange;
