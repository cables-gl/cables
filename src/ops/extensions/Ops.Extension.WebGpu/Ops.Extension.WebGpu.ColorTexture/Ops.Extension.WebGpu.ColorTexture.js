const
    inexec = op.inTrigger("Render"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1.0),
    next = op.outTrigger("Next"),
    texOut = op.outTexture("texture_out");

r.setUiAttribs({ "colorPick": true });

let tex = null;
let needsUpdate = true;
r.onChange =
    g.onChange =
    b.onChange =
    a.onChange = () => { needsUpdate = true; };

inexec.onTriggered = render;

function render()
{
    if (needsUpdate)
    {
        let size = 8;
        const data2 = CABLES.CGP.Texture.getDefaultTextureData("color", size, { "r": r.get() * 255, "g": g.get() * 255, "b": b.get() * 255 });

        const tex = new CABLES.CGP.Texture(op.patch.cgp);
        tex.initFromData(data2, size, size);
        texOut.setRef(tex);
        needsUpdate = false;
    }

    next.trigger();
}
