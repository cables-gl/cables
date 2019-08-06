
var inR=op.inValueSlider("R",0);
var inG=op.inValueSlider("G",0);
var inB=op.inValueSlider("B",0);

var outH=op.outValue("Hue");
var outS=op.outValue("Saturation");
var outB=op.outValue("Brightness");



inR.onChange=inG.onChange=inB.onChange=update;

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

    var r=(inR.get());
    var g=(inG.get());
    var b=(inB.get());


// public static float[] RGBtoHSB(var r, var g, var b, float[] hsbvals) {
   var hue, saturation, brightness;
//   if (hsbvals == null) {
//       hsbvals = [];
//   }
   var cmax = (r > g) ? r : g;
   if (b > cmax) cmax = b;
   var cmin = (r < g) ? r : g;
   if (b < cmin) cmin = b;

   brightness = (cmax) ;
   if (cmax != 0)
       saturation = ((cmax - cmin)) / (cmax);
   else
       saturation = 0;
   if (saturation == 0)
       hue = 0;
   else {
       var redc = ((cmax - r)) / ((cmax - cmin));
       var greenc = ((cmax - g)) / ((cmax - cmin));
       var bluec = ((cmax - b)) / ((cmax - cmin));
       if (r == cmax)
           hue = bluec - greenc;
       else if (g == cmax)
           hue = 2.0 + redc - bluec;
       else
           hue = 4.0 + greenc - redc;
       hue = hue / 6.0;
       if (hue < 0)
           hue = hue + 1.0;
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
    outB.set(brightness/2.0);

}

update();
