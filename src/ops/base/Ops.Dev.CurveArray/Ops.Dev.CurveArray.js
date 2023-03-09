const
    numValues = op.inValueInt("Num Values", 10),

    // format x/xy/xyz
    // num values: num keys, sample
    // num values

    inGrad = op.inGradient("Ramp"),
    min = op.inValueFloat("Min", 0),
    max = op.inValueFloat("Max", 1),
    values = op.outArray("Array", 3);

op.setPortGroup("Value Range", [min, max]);
inGrad.setUiAttribs({ "gradientType": "curve", "editShortcut": true });

max.onChange =
    min.onChange =
    numValues.onChange =
    inGrad.onChange = init;

let arr = [];
init();

function init()
{
    let arrLength = arr.length = Math.max(0, Math.abs(parseInt(numValues.get() || 0)));
    let minIn = min.get();
    let maxIn = max.get();

    const grad = JSON.parse(inGrad.get());
    const anim = new CABLES.Anim();

    if (grad && grad.keys)
    {
        for (let i = 0; i < grad.keys.length - 1; i++)
        {
            anim.setValue(grad.keys[i].pos, 1.0 - grad.keys[i].posy);
        }
    }

    if (arrLength === 0)
    {
        values.set(null);
        return;
    }

    for (let i = 0; i < arrLength; i++)
    {
        arr[i * 3] = i / arrLength;
        arr[i * 3 + 1] = anim.getValue(i / arrLength) * (maxIn - minIn) + minIn;
        arr[i * 3 + 2] = 0;
    }

    values.setRef(arr);
}
