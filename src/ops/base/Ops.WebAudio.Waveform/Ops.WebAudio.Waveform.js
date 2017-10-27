op.name="Waveform";

// currently only uses mono, if we want to extract stereo data some changes in extractPeaks are needed

// constants
var SAMPLES_PER_PIXEL_MIN = 50; // might crash when this is too low
var MULTIPLIER = 0.01; // multiplier for each point, to scale the output

// input
var audioBufferPort = op.inObject("Audio Buffer");
var samplesPerPixelPort = op.inValue("Samples Per Pixel", 10000);
var showBottomHalfPort = op.inValueBool("Show bottom half", true);

// output
var splinePointsPort = op.outArray("Spline Points");
//var peaksPort = op.outArray("Peaks"); // in case we need the raw values sometime...

// change listeners
audioBufferPort.onChange = extractPeaks;
samplesPerPixelPort.onChange = extractPeaks;
showBottomHalfPort.onChange = extractPeaks;


// functions
function extractPeaks() {
    var audioBuffer = audioBufferPort.get();
    if(audioBuffer) {
        var samplesPerPixel = samplesPerPixelPort.get();
        if (samplesPerPixel < SAMPLES_PER_PIXEL_MIN) {
            samplesPerPixel = SAMPLES_PER_PIXEL_MIN;
        }
        var useMono = true; // TODO: If we make this a parameter, we have to check if the audio actually is stereo
        var peaks = webaudioPeaks(audioBuffer, samplesPerPixel, useMono);
        console.log('peaks: ', peaks);
        // because we extract mono peaks we just access [0] here
        var typedArr = peaks.data[0];
        var regularArr = Array.prototype.slice.call(typedArr);
        // currently the array contains values like this: [y1top, y1bottom, y2top, ...]
        // we want it to be: [y1top, y2top, ..., y2bottom, y1bottom]
        var resortedArr = [];
        // to center the waveform around the corrdinate origin, we need to offset its position
        var offset = regularArr.length * MULTIPLIER / 2;
        if(showBottomHalfPort.get()) {
            for(var i=0; i<regularArr.length; i+=2) {
                resortedArr.push(i*MULTIPLIER - offset, regularArr[i]*MULTIPLIER, 0); // works without orbit controls
            }    
        }
        
        for(var j=regularArr.length-1; j>0; j-=2) {
            resortedArr.push(j*MULTIPLIER - offset, regularArr[j]*MULTIPLIER, 0);
        }    
        
        // peaksPort.set(regularArr);
        splinePointsPort.set(resortedArr);
    }
}

