op.name="HSVtoRGB";

var outR=op.outValue("R");
var outG=op.outValue("G");
var outB=op.outValue("B");

var inH=op.inValueSlider("Hue");
var inS=op.inValueSlider("Saturation",1);
var inV=op.inValueSlider("Value",1);

var r, g, b, i, f, p, q, t;

inH.onChange=inS.onChange=inV.onChange=function()
{
    var h=inH.get();
    var s=inS.get();
    var v=inV.get();


    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    outR.set(r);
    outG.set(g);
    outB.set(b);

    // return {
    //     r: Math.round(r * 255),
    //     g: Math.round(g * 255),
    //     b: Math.round(b * 255)
    // };
};
