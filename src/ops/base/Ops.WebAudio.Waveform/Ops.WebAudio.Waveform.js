// currently only uses mono, if we want to extract stereo data some changes in extractPeaks are needed

// constants
var SAMPLES_PER_PIXEL_MIN = 50; // might crash when this is too low
var MULTIPLIER = 0.01; // multiplier for each point, to scale the output

// vars
var geom = new CGL.Geometry("Waveform");
var mesh = null;
var cgl = op.patch.cgl;

// input
var renderPort = op.inTrigger("Render");
var audioBufferPort = op.inObject("Audio Buffer");
var widthPort = op.inValue("Width", 30);
var samplesPerPixelPort = op.inValue("Samples Per Pixel", 10000);
var showBottomHalfPort = op.inValueBool("Show bottom half", true);
var centerPort = op.inValueBool("Center Origin", true);
var renderActivePort = op.inValueBool("Render Active", true);

// output
var nextPort = op.outTrigger("Next");
var splinePointsPort = op.outArray("Spline Points");
var geometryPort = op.outObject("Geometry");


// change listeners
audioBufferPort.onChange = extractPeaks;
samplesPerPixelPort.onChange = extractPeaks;
showBottomHalfPort.onChange = extractPeaks;
centerPort.onChange = extractPeaks;
widthPort.onChange = extractPeaks;

renderPort.onTriggered = renderMesh;


// functions
function renderMesh() {
    if(mesh && renderActivePort.get()) {
        mesh.render(cgl.getShader());   
    }
    nextPort.trigger();
}

function createMesh(meshPoints) {
    geom.vertices = meshPoints;
    mesh = new CGL.Mesh(cgl, geom);
    geometryPort.set(null);
    geometryPort.set(geom);
}

/*
 * Add to triangles to the mesh
 * z-coordinate is assumed to be 0.
 * @param meshPoints The mesh to add triangles to, [x0, y0, z0, x1, y1, z1, ...]
 * @param splinePoints The source for the traingle coordinates, [x0, y0, z0, x1, y1, z1, ...]
 @ param i The index of the first x-coordinate in splinePoints array
 */
function addTrianglesToMesh(meshPoints, splinePoints, i) {
    // first triangle
    meshPoints.push(splinePoints[i], splinePoints[i+1], 0); // point a
    meshPoints.push(splinePoints[i+3], splinePoints[i+4], 0); // point b
    meshPoints.push(splinePoints[i+3], 0, 0); // point b (y=0)
    // second triangle
    meshPoints.push(splinePoints[i], splinePoints[i+1], 0); // point a
    meshPoints.push(splinePoints[i+3], 0, 0); // point b (y=0)
    meshPoints.push(splinePoints[i], 0, 0); // point a (y=0)
}

/**
 * Creates triangles in the form [ax, ay, az, bx, by, bz, cx, cy, cz, ...]
 * based on all points in splinePoints
 */
function createMeshPoints(splinePoints) {
    if(!splinePoints) { return []; }
    var meshPoints = [];
    // if we only draw one half, we can just go over all points
    if(!showBottomHalfPort.get()) {
        for(var i=0; i<splinePoints.length-5; i+=3) {
            addTrianglesToMesh(meshPoints, splinePoints, i);
        }    
    } 
    // if both sides are drawn, we need to handle the end point differently
    else {
        // add top half
        for(var i=0; i<(splinePoints.length / 2) - 5; i+=3) {
            addTrianglesToMesh(meshPoints, splinePoints, i);
        }
        // add bottom half
        for(var i=(splinePoints.length / 2); i<splinePoints.length - 5; i+=3) {
            addTrianglesToMesh(meshPoints, splinePoints, i);
        }
    }
    return meshPoints;
}

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
        var offset = 0;
        var width = widthPort.get();
        if(centerPort.get()) {
            offset = regularArr.length * MULTIPLIER / 2;    
        }
        for(var i=1; i<regularArr.length; i+=2) {
            resortedArr.push(i*MULTIPLIER - offset, regularArr[i]*MULTIPLIER, 0);
        }
        var minX = resortedArr[0];
        var maxX = resortedArr[resortedArr.length-3];
        if(showBottomHalfPort.get()) {
            for(var i=regularArr.length-2; i>=0; i-=2) {
                resortedArr.push(i*MULTIPLIER - offset, regularArr[i]*MULTIPLIER, 0);
            }
        }
        // re-map range of x-coordinates
        var toMin = 0;
        var toMax = width;
        if(centerPort.get()) {
            toMin = -width/2;
            toMax = width/2;
        }
        for(var i=0; i<resortedArr.length; i+=3) {
            resortedArr[i] = mapRange(resortedArr[i], minX, maxX, toMin, toMax);
        }
        // resortedArr now looks like: [yTop0, yTop1, ..., yBottom1, yBottom0]
        var meshPoints = createMeshPoints(resortedArr);
        createMesh(meshPoints);
        
        splinePointsPort.set(resortedArr);
    } else {
        splinePointsPort.set(null);
        geometryPort.set(null);
    }
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

