const
    inH = op.inValueSlider("Hue"),
    inS = op.inValueSlider("Saturation", 1),
    inV = op.inValueSlider("Brightness", 0.5),
    outR = op.outNumber("R"),
    outG = op.outNumber("G"),
    outB = op.outNumber("B");

inH.onChange = inS.onChange = inV.onChange = update;
update();

function update()
{
    let hue = (inH.get());
    let saturation = (inS.get());
    let lightness = (inV.get());

    // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB

    let chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
    let huePrime = hue * 6; // / 60;
    let secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = Math.floor(huePrime) || 0;
    let red = 0;
    let green = 0;
    let blue = 0;

    if (huePrime === 0)
    {
        red = chroma;
        green = secondComponent;
        blue = 0;
    }
    else if (huePrime === 1)
    {
        red = secondComponent;
        green = chroma;
        blue = 0;
    }
    else if (huePrime === 2)
    {
        red = 0;
        green = chroma;
        blue = secondComponent;
    }
    else if (huePrime === 3)
    {
        red = 0;
        green = secondComponent;
        blue = chroma;
    }
    else if (huePrime === 4)
    {
        red = secondComponent;
        green = 0;
        blue = chroma;
    }
    else if (huePrime >= 5)
    {
        red = chroma;
        green = 0;
        blue = secondComponent;
    }
    let lightnessAdjustment = (lightness - (chroma / 2));
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    outR.set(red);
    outG.set(green);
    outB.set(blue);

    //   return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
}
