const
    text = op.inString("Text", "https://cables.gl"),
    width = op.inInt("Width", 256),
    height = op.inInt("Height", 256),
    correctLevel = op.inSwitch("Error Correction", ["L", "M", "Q", "H"], "H"),
    darkR = op.inFloatSlider("Dark R", 0),
    darkG = op.inFloatSlider("Dark G", 0),
    darkB = op.inFloatSlider("Dark B", 0),
    darkA = op.inFloatSlider("Dark A", 1),
    lightR = op.inFloatSlider("Light R", 1),
    lightG = op.inFloatSlider("Light G", 1),
    lightB = op.inFloatSlider("Light B", 1),
    lightA = op.inFloatSlider("Light A", 1),
    outImage = op.outObject("Image", null, "element");

darkR.setUiAttribs({ "colorPick": true });
lightR.setUiAttribs({ "colorPick": true });

op.setPortGroup("Size", [width, height]);
op.setPortGroup("Dark Color", [darkR, darkG, darkB, darkA]);
op.setPortGroup("Light Color", [lightR, lightG, lightB, lightA]);

text.onChange =
    width.onChange =
    height.onChange =
    correctLevel.onChange =
    darkR.onChange = darkG.onChange = darkB.onChange = darkA.onChange =
    lightR.onChange = lightG.onChange = lightB.onChange = lightA.onChange = generate;

generate();

function rgba(r, g, b, a)
{
    return "rgba(" + Math.floor(r.get() * 255) + "," + Math.floor(g.get() * 255) + "," + Math.floor(b.get() * 255) + "," + a.get() + ")";
}

function generate()
{
    // detached container, never added to the document
    const ele = document.createElement("div");

    try
    {
        new QRCode(ele,
        {
            "text": text.get(),
            "width": Math.max(1, width.get()),
            "height": Math.max(1, height.get()),
            "colorDark": rgba(darkR, darkG, darkB, darkA),
            "colorLight": rgba(lightR, lightG, lightB, lightA),
            "correctLevel": QRCode.CorrectLevel[correctLevel.get()]
        });
        op.setUiError("qr", null);
    }
    catch (e)
    {
        op.setUiError("qr", e.message);
        outImage.set(null);
        return;
    }

    outImage.set(ele.querySelector("canvas"));
}
