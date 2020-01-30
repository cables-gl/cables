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

const outA = op.outNumber("A");
const outB = op.outNumber("B");


function handleMinMaxChange() {
    anim.keys[0].time= anim.keys[0].value = Math.min(inMinOut.get(),inMaxOut.get());
    anim.keys[1].time= anim.keys[1].value = Math.max(inMinOut.get(),inMaxOut.get());
    handleValueChange();
}
function handleValueChange() {
    const val = inFade.get();

    const realMin = Math.min(inMaxOut.get(), inMinOut.get());
    const realMax = Math.max(inMaxOut.get(), inMinOut.get());

    // Y = (X-A)/(B-A) * (D-C) + C
    const resultA = anim.getValue((1-val) * (realMax - realMin) + realMin);
    const resultB = anim.getValue(val * (realMax - realMin) + realMin);

    outA.set(resultA);
    outB.set(resultB);
}

function updateMinMax() {
    anim.keys[0].time = anim.keys[0].value = Math.min(inMinOut.get(), inMaxOut.get());
    anim.keys[1].time = anim.keys[1].value = Math.max(inMinOut.get(), inMaxOut.get());
}

handleValueChange();

inMinOut.onChange = inMaxOut.onChange = handleMinMaxChange;
inFade.onChange = handleValueChange;
