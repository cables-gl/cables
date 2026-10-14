const
    r = op.inFloatSlider("r", Math.random()),
    g = op.inFloatSlider("g", Math.random()),
    b = op.inFloatSlider("b", Math.random()),
    result=op.outString("Result");

r.setUiAttribs({ colorPick: true });

r.onChange=
g.onChange=
b.onChange=()=>
{

    const red=parseInt(r.get()*255);
    const green=parseInt(g.get()*255);
    const blue=parseInt(b.get()*255);

    result.set(((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1));
};