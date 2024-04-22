const
    inObject = op.inObject("Object"),
    outObject = op.outObject("Result Object"),
    inKey = op.inString("Key"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1),
    outR = op.outNumber("Out R"),
    outG = op.outNumber("Out G"),
    outB = op.outNumber("Out B"),
    outA = op.outNumber("Out A");

r.setUiAttribs({ "colorPick": true });

inObject.onChange =
    r.onChange =
    g.onChange =
    b.onChange = update;

inKey.setUiAttribs({ "stringTrim": true, "minLength": 1 });

function update()
{
    const obj = inObject.get() || {};

    const newObj = JSON.parse(JSON.stringify(obj));

    if (inKey.get()) newObj[inKey.get()] = [r.get(), g.get(), b.get(), a.get()];

    outObject.setRef(newObj);

    outR.set(r.get());
    outG.set(g.get());
    outB.set(b.get());
    outA.set(a.get());
}

inKey.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inKey.get() });
    update();
};
