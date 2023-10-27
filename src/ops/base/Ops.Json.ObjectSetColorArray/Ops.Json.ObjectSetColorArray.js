const
    inObject = op.inObject("Object"),
    outObject = op.outObject("Result Object"),
    inKey = op.inString("Key"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1);

r.setUiAttribs({ "colorPick": true });

inObject.onChange =
    r.onChange =
    g.onChange =
    b.onChange = update;

function update()
{
    const obj = inObject.get() || {};

    const newObj = JSON.parse(JSON.stringify(obj));

    if (inKey.get()) newObj[inKey.get()] = [r.get(), g.get(), b.get(), a.get()];

    outObject.setRef(newObj);
}

inKey.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inKey.get() });
    update();
};
