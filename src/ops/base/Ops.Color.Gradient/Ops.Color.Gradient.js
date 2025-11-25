const inGrad = op.inGradient("Gradient"),
    inRandom = op.inTriggerButton("Randomize Colors"),
    outColors = op.outArray("Colors", null, 3),
    outColorPos = op.outArray("Colors Pos", null, 1);

let timeout = null;
inGrad.setUiAttribs({ "editShortcut": true });

inGrad.onChange = update;

inGrad.set("{\"keys\" : [{\"pos\":0,\"r\":0,\"g\":0,\"b\":0},{\"pos\":1,\"r\":1,\"g\":1,\"b\":1}]}");

op.onLoaded = update;

inRandom.onTriggered = () =>
{
    const keys = parseKeys();
    if (keys)
    {
        keys.forEach((key) =>
        {
            key.r = Math.random();
            key.g = Math.random();
            key.b = Math.random();
        });
        const newKeys = JSON.stringify({ "keys": keys });
        inGrad.set(newKeys);
    }
};

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

    {
        let grad = null;
        if (!inGrad.get() || inGrad.get() === "")
        {
            // op.setUiError("nodata", "gradient no data");
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
        keys = grad.keys;
    }
    return keys;
}

function updateGradient(keys)
{
    const colorArr = [];
    for (let i = 0; i < keys.length - 1; i++)
        colorArr.push(keys[i].r, keys[i].g, keys[i].b);

    const colorPosArr = [];
    for (let i = 0; i < keys.length - 1; i++)
        colorPosArr.push(keys[i].pos);

    outColors.set(colorArr);
    outColorPos.set(colorPosArr);
}
