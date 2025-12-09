// currently only uses mono, if we want to extract stereo data some changes in extractPeaks are needed

// constants
const SAMPLES_PER_PIXEL_MIN = 50; // might crash when this is too low
const MULTIPLIER = 0.01; // multiplier for each point, to scale the output

// vars
const geom = new CGL.Geometry("Waveform");
let mesh = null;
const cgl = op.patch.cgl;

// input
const renderPort = op.inTrigger("Render");
const audioBufferPort = op.inObject("Audio Buffer");
const widthPort = op.inValue("Width", 30);
const samplesPerPixelPort = op.inValue("Samples Per Pixel", 10000);
const showBottomHalfPort = op.inValueBool("Show bottom half", true);
const centerPort = op.inValueBool("Center Origin", true);
const renderActivePort = op.inValueBool("Render Active", true);

// output
const nextPort = op.outTrigger("Next");
const splinePointsPort = op.outArray("Spline Points");
const geometryPort = op.outObject("Geometry");

// change listeners
audioBufferPort.onChange = extractPeaks;
samplesPerPixelPort.onChange = extractPeaks;
showBottomHalfPort.onChange = extractPeaks;
centerPort.onChange = extractPeaks;
widthPort.onChange = extractPeaks;

renderPort.onTriggered = renderMesh;

// functions
function renderMesh()
{
    if (mesh && renderActivePort.get())
    {
        mesh.render(cgl.getShader());
    }
    nextPort.trigger();
}

function createMesh(meshPoints)
{
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
function addTrianglesToMesh(meshPoints, splinePoints, i)
{
    // first triangle
    meshPoints.push(splinePoints[i], splinePoints[i + 1], 0); // point a
    meshPoints.push(splinePoints[i + 3], splinePoints[i + 4], 0); // point b
    meshPoints.push(splinePoints[i + 3], 0, 0); // point b (y=0)
    // second triangle
    meshPoints.push(splinePoints[i], splinePoints[i + 1], 0); // point a
    meshPoints.push(splinePoints[i + 3], 0, 0); // point b (y=0)
    meshPoints.push(splinePoints[i], 0, 0); // point a (y=0)
}

/**
 * Creates triangles in the form [ax, ay, az, bx, by, bz, cx, cy, cz, ...]
 * based on all points in splinePoints
 */
function createMeshPoints(splinePoints)
{
    if (!splinePoints) { return []; }
    let meshPoints = [];
    // if we only draw one half, we can just go over all points
    if (!showBottomHalfPort.get())
    {
        for (var i = 0; i < splinePoints.length - 5; i += 3)
        {
            addTrianglesToMesh(meshPoints, splinePoints, i);
        }
    }
    // if both sides are drawn, we need to handle the end point differently
    else
    {
        // add top half
        for (var i = 0; i < (splinePoints.length / 2) - 5; i += 3)
        {
            addTrianglesToMesh(meshPoints, splinePoints, i);
        }
        // add bottom half
        for (var i = (splinePoints.length / 2); i < splinePoints.length - 5; i += 3)
        {
            addTrianglesToMesh(meshPoints, splinePoints, i);
        }
    }
    return meshPoints;
}

function extractPeaks()
{
    const audioBuffer = audioBufferPort.get();
    if (audioBuffer)
    {
        if (!(audioBuffer instanceof AudioBuffer))
        {
            op.setUiError("noAudioBuffer", "The passed object is not of type AudioBuffer. You have to pass an AudioBuffer to visualize the waveform.", 2);
            return;
        }
        else
        {
            op.setUiError("noAudioBuffer", null);
        }
    }
    else
    {
        op.setUiError("noAudioBuffer", null);
    }

    if (audioBuffer)
    {
        let samplesPerPixel = samplesPerPixelPort.get();
        if (samplesPerPixel < SAMPLES_PER_PIXEL_MIN)
        {
            op.setUiError("minSamples", "The value for \"Samples Per Pixel\" is lower than the minimum value " + SAMPLES_PER_PIXEL_MIN + ". Therefore the value has been set to " + SAMPLES_PER_PIXEL_MIN + ".", 1);
            samplesPerPixel = SAMPLES_PER_PIXEL_MIN;
        }
        else
        {
            op.setUiError("minSamples", null);
        }
        let useMono = true; // TODO: If we make this a parameter, we have to check if the audio actually is stereo
        const peaks = webaudioPeaks(audioBuffer, samplesPerPixel, useMono);
        op.log("peaks: ", peaks);
        // because we extract mono peaks we just access [0] here
        const typedArr = peaks.data[0];
        const regularArr = Array.prototype.slice.call(typedArr);
        // currently the array contains values like this: [y1top, y1bottom, y2top, ...]
        // we want it to be: [y1top, y2top, ..., y2bottom, y1bottom]
        const resortedArr = [];
        // to center the waveform around the corrdinate origin, we need to offset its position
        let offset = 0;
        let width = widthPort.get();
        if (centerPort.get())
        {
            offset = regularArr.length * MULTIPLIER / 2;
        }
        for (var i = 1; i < regularArr.length; i += 2)
        {
            resortedArr.push(i * MULTIPLIER - offset, regularArr[i] * MULTIPLIER, 0);
        }
        const minX = resortedArr[0];
        const maxX = resortedArr[resortedArr.length - 3];
        if (showBottomHalfPort.get())
        {
            for (var i = regularArr.length - 2; i >= 0; i -= 2)
            {
                resortedArr.push(i * MULTIPLIER - offset, regularArr[i] * MULTIPLIER, 0);
            }
        }
        // re-map range of x-coordinates
        let toMin = 0;
        let toMax = width;
        if (centerPort.get())
        {
            toMin = -width / 2;
            toMax = width / 2;
        }
        for (var i = 0; i < resortedArr.length; i += 3)
        {
            resortedArr[i] = mapRange(resortedArr[i], minX, maxX, toMin, toMax);
        }
        // resortedArr now looks like: [yTop0, yTop1, ..., yBottom1, yBottom0]
        let meshPoints = createMeshPoints(resortedArr);
        createMesh(meshPoints);

        splinePointsPort.set(resortedArr);
    }
    else
    {
        splinePointsPort.set(null);
        geometryPort.set(null);
    }
}

function mapRange(value, inMin, inMax, outMin, outMax)
{
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
