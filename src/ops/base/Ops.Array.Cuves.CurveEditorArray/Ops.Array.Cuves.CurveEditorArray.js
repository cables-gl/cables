const inGrad = op.inCurve("Curve"),
    inNum = op.inInt("Array Length", 10),
    outArray = op.outArray("Array");

let timeout = null;
let anim = null;
inGrad.setUiAttribs({ "editShortcut": true, "hidePort": true });

op.onLoaded =
inNum.onChange =
  inGrad.onChange = update;

inGrad.set("{\"keys\" : [{\"pos\":0,\"r\":0,\"g\":0,\"b\":0},{\"pos\":1,\"r\":1,\"g\":1,\"b\":1}]}");

function update()
{
    const keys = parseKeys();
    if (keys) updateGradient(keys);
}

function parseKeys()
{
    let keys = null;
    op.setUiError("nodata", null);
    op.setUiError("parse", null);

    let grad = null;
    if (!inGrad.get() || inGrad.get() === "")
    {
        return null;
    }

    try
    {
        grad = JSON.parse(inGrad.get());
    }
    catch (e)
    {
        op.setUiError("parse", "could not parse gradient data");
    }

    if (!grad || !grad.keys)
    {
        op.setUiError("nodata", "gradient no data");
        return null;
    }
    anim = new CABLES.Anim();
    for (let index = 0; index < grad.keys.length; index++)
    {
        anim.setValue(grad.keys[index].pos, 1 - grad.keys[index].posy);
    }

    return grad.keys;
}

function updateGradient(keys)
{
    const vals = [];

    const num = Math.abs((inNum.get()));
    for (let i = 0; i < num; i++)
    {
        vals[i] = anim.getValue(i / num);
    }

    outArray.setUiAttribs({ "stride": 1 });
    outArray.setRef(vals);
}
