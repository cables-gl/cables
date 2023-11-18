const
    inR = op.inValueSlider("R", 0),
    inG = op.inValueSlider("G", 0),
    inB = op.inValueSlider("B", 0),
    outH = op.outNumber("Hue"),
    outS = op.outNumber("Saturation"),
    outB = op.outNumber("Brightness");

inR.setUiAttribs({ "colorPick": true });
inR.onChange = inG.onChange = inB.onChange = update;

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */

function update()
{
    let r = (inR.get());
    let g = (inG.get());
    let b = (inB.get());

    // public static float[] RGBtoHSB(var r, var g, var b, float[] hsbvals) {
    let hue, saturation, brightness;
    //   if (hsbvals == null) {
    //       hsbvals = [];
    //   }
    let cmax = (r > g) ? r : g;
    if (b > cmax) cmax = b;
    let cmin = (r < g) ? r : g;
    if (b < cmin) cmin = b;

    brightness = (cmax);
    if (cmax != 0)
        saturation = ((cmax - cmin)) / (cmax);
    else
        saturation = 0;
    if (saturation == 0)
        hue = 0;
    else
    {
        let redc = ((cmax - r)) / ((cmax - cmin));
        let greenc = ((cmax - g)) / ((cmax - cmin));
        let bluec = ((cmax - b)) / ((cmax - cmin));
        if (r == cmax)
            hue = bluec - greenc;
        else if (g == cmax)
            hue = 2.0 + redc - bluec;
        else
            hue = 4.0 + greenc - redc;
        hue /= 6.0;
        if (hue < 0)
            hue += 1.0;
    }

    //   hsbvals[0] = hue;
    //   hsbvals[1] = saturation;
    //   hsbvals[2] = brightness;
    //   return hsbvals;
    //   942       }
    // var max = Math.max(r, g, b), min = Math.min(r, g, b);
    // var h, s, v = max;

    // var d = max - min;
    // s = max == 0 ? 0 : d / max;

    // if (max == min) {
    //     h = 0; // achromatic
    // } else {
    //     switch (max) {
    //     case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    //     case g: h = (b - r) / d + 2; break;
    //     case b: h = (r - g) / d + 4; break;
    //     }

    //     h /= 6;
    // }

    outH.set(hue);
    outS.set(saturation);
    outB.set(brightness / 2.0);
}

update();
