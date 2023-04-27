const

    inVal = op.inFloatSlider("Value", 0),
    inGrad = op.inGradient("Ramp"),
    outResult = op.outNumber("Result");
inGrad.setUiAttribs({ "gradientType": "curve", "editShortcut": true });

inGrad.onChange = init;
inVal.onChange = update;

let arr = [];
const anim = new CABLES.Anim();

function update()
{
    outResult.set(anim.getValue(inVal.get()));
}

function init()
{
    // let arrLength = arr.length = Math.max(0, Math.abs(parseInt(numValues.get() || 0)));
    anim.clear();
    const grad = JSON.parse(inGrad.get());
    console.log(grad);
    if (grad && grad.keys)
    {
        for (let i = 0; i < grad.keys.length - 1; i++)
        {
            anim.setValue(grad.keys[i].pos, 1.0 - grad.keys[i].posy);
        }
    }

    update();

    // if (arrLength === 0)
    // {
    //     values.set(null);
    //     return;
    // }

    // for (let i = 0; i < arrLength; i++)
    // {
    //     arr[i] = anim.getValue(i / arrLength) * (maxIn - minIn) + minIn;
    // }

    // values.setRef(arr);
}
