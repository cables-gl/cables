var outR=op.outValue("R");
var outG=op.outValue("G");
var outB=op.outValue("B");

var inH=op.inValueSlider("Hue");
var inS=op.inValueSlider("Saturation",1);
var inV=op.inValueSlider("Brightness",0.5);

// var hslToRgb = function(hue, saturation, lightness){
inH.onChange=inS.onChange=inV.onChange=update;
update();

function update()
{

    var hue=(inH.get());
    var saturation=(inS.get());
    var lightness=(inV.get());

    // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB

    var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
    var huePrime = hue *6; // / 60;
    var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = Math.floor(huePrime)||0;
    var red=0;
    var green=0;
    var blue=0;

    if( huePrime === 0 ){
        red = chroma;
        green = secondComponent;
        blue = 0;
    }else if( huePrime === 1 ){
        red = secondComponent;
        green = chroma;
        blue = 0;
    }else if( huePrime === 2 ){
        red = 0;
        green = chroma;
        blue = secondComponent;
    }else if( huePrime === 3 ){
        red = 0;
        green = secondComponent;
        blue = chroma;
    }else if( huePrime === 4 ){
        red = secondComponent;
        green = 0;
        blue = chroma;
    }else if( huePrime >= 5){
        red = chroma;
        green = 0;
        blue = secondComponent;
    }
    var lightnessAdjustment = (lightness - (chroma / 2));
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    outR.set(red);
    outG.set(green);
    outB.set(blue);

//   return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];

};
