function HSBtoRGB(hue, saturation, lightness) {
    // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
    const chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
    var huePrime = hue * 6; // / 60;
    var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = Math.floor(huePrime) || 0;
    var red = 0;
    var green = 0;
    var blue = 0;

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

    const lightnessAdjustment = (lightness - (chroma / 2));

    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    return [red, green, blue];
}

const inTrigger = op.inTrigger("Trigger Input");
const inHue = op.inArray("In Hue Array");
const inSat = op.inArray("In Saturation Array");
const inBright = op.inArray("In Brightness Array");
const inAlpha = op.inArray("In Alpha Array");

const outTrigger = op.outTrigger("Trigger Output");
const outArray=op.outArray("Result Array");
const outLength = op.outNumber("Array Length", 0);
const outTupleLength = op.outNumber("RGBA Tuple Length", 0);

var newArr = [];
const emptyArr = [];
outArray.set(newArr);
outLength.set(newArr.length);
outTupleLength.set(newArr.length / 4);



var shouldRecalculate = true;

inTrigger.onTriggered = handleTrigger;
inHue.onChange = inSat.onChange = inBright.onChange = inAlpha.onChange = function() { shouldRecalculate = true };

function handleTrigger() {
    var arrH = inHue.get();
    var arrS = inSat.get();
    var arrB = inBright.get();
    var arrA = inAlpha.get();

    if(!arrH && !arrS && !arrB && !arrA) {
        outArray.set(null);
        outLength.set(0);
        outTupleLength.set(0);
        return;
    }

    let length = 0;


    if (shouldRecalculate) {
        if ([arrH, arrS, arrB, arrA].some(function(array) {  return !array })) {
            op.log("imhere");
            if (arrH) length = arrH.length;
            else if (arrS) length = arrS.length;
            else if (arrB) length = arrB.length;
            else if (arrA) length = arrA.length;

            emptyArr.length = length;
            for (let i = 0; i < length; i += 1) emptyArr[i] = 0;

            if (!arrH) arrH = emptyArr.map(function(val) { return 0; });
            if (!arrS) arrS = emptyArr.map(function(val) { return 1; });
            if (!arrB) arrB = emptyArr.map(function(val) { return 0.5; });
            if (!arrA) arrA = emptyArr.map(function(val) { return 1; });
        } else {
            length = arrH.length;
        }

        const areSameLength = [arrH, arrS, arrB, arrA].every(function(val, i, arr) { return val.length === length;});

        if (!areSameLength) {
            //op.log([arrH, arrS, arrB, arrA].map(a => a.length), length);
            op.setError("Arrays don't have the same length!");
        } else {
            op.setError(null);
        }

        newArr.length = length * 4;

        for (let i = 0; i < newArr.length / 4; i += 1) {
            const hsbArray = HSBtoRGB(arrH[i], arrS[i], arrB[i]);
            newArr[i * 4 + 0] = hsbArray[0];
            newArr[i * 4 + 1] = hsbArray[1];
            newArr[i * 4 + 2] = hsbArray[2];
            newArr[i * 4 + 3] = arrA[i];
        }

        shouldRecalculate = false;
        outArray.set(null);
        outArray.set(newArr);
        outLength.set(newArr.length);
        outTupleLength.set(newArr.length / 4);

    }
    outTrigger.trigger();
};
