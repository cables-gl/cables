const
    inH = op.inFloat("Hue", 0),
    inS = op.inFloat("Saturation", 1),
    inB = op.inFloat("Brightness", 1),
    outR = op.outNumber("R"),
    outG = op.outNumber("G"),
    outB = op.outNumber("B");

inH.onChange =
    inS.onChange =
    inB.onChange = update;

update();

function update()
{
    const hue = inH.get() - Math.floor(inH.get());
    const sat = CABLES.clamp(inS.get(), 0, 1);
    const bri = inB.get();

    const sector = hue * 6;
    const index = Math.floor(sector);
    const fraction = sector - index;

    const p = bri * (1 - sat);
    const q = bri * (1 - fraction * sat);
    const t = bri * (1 - (1 - fraction) * sat);

    let r = bri;
    let g = t;
    let b = p;

    if (index == 1)
    {
        r = q;
        g = bri;
        b = p;
    }
    else if (index == 2)
    {
        r = p;
        g = bri;
        b = t;
    }
    else if (index == 3)
    {
        r = p;
        g = q;
        b = bri;
    }
    else if (index == 4)
    {
        r = t;
        g = p;
        b = bri;
    }
    else if (index == 5)
    {
        r = bri;
        g = p;
        b = q;
    }

    outR.set(r);
    outG.set(g);
    outB.set(b);
}
