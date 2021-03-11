// currently only uses mono, if we want to extract stereo data some changes in extractPeaks are needed

// constants
const SAMPLES_PER_PIXEL_MIN = 100; // might crash when this is too low

function findMinMax(array)
{
    let min = Infinity;
    let max = -Infinity;
    let i = 0;
    let len = array.length;
    let curr;

    for (; i < len; i++)
    {
        curr = array[i];
        if (min > curr)
        {
            min = curr;
        }
        if (max < curr)
        {
            max = curr;
        }
    }

    return {
        "min": min,
        "max": max
    };
}

// vars
const geom = new CGL.Geometry("Waveform");
let mesh = null;
const cgl = op.patch.cgl;

// input
const renderPort = op.inTrigger("Render");
const audioBufferPort = op.inObject("Audio Buffer", null, "audioBuffer");
const renderActivePort = op.inBool("Render Active", true);
const showBottomHalfPort = op.inBool("Show bottom half", true);
const centerPort = op.inBool("Center Origin", true);
const widthPort = op.inValue("Width", 30);
const samplesPerPixelPort = op.inInt("Samples Per Pixel", 10000);
const inCalculateUV = op.inBool("Calculate Tex Coords", true);

op.setPortGroup("Render Options", [renderActivePort, showBottomHalfPort, centerPort]);
op.setPortGroup("Waveform Settings", [widthPort, samplesPerPixelPort]);
op.setPortGroup("Mesh Options", [inCalculateUV]);
// output
const nextPort = op.outTrigger("Next");
const geometryPort = op.outObject("Geometry", null, "geometry");

// change listeners
let updating = true;
audioBufferPort.onChange = samplesPerPixelPort.onChange
= showBottomHalfPort.onChange = centerPort.onChange
= widthPort.onChange = inCalculateUV.onChange = () =>
        {
            updating = true;
        };

renderPort.onTriggered = () =>
{
    if (updating)
    {
        extractPeaks();
        updating = false;
    }
    if (mesh && renderActivePort.get())
    {
        mesh.render(cgl.getShader());
    }
    nextPort.trigger();
};

// functions
function calculateUV(meshPoints)
{
    const texCoordsNew = [];
    const xTex = [];
    const yTex = [];

    for (let i = 0; i < meshPoints.length; i += 3)
    {
        xTex.push(meshPoints[i + 0]);
        yTex.push(meshPoints[i + 1]);
    }

    const minMaxX = findMinMax(xTex);
    const minMaxY = findMinMax(yTex);

    const normalizedTexX = xTex.map((val) => mapRange(val, minMaxX.min, minMaxX.max, 0, 1));
    const normalizedTexY = yTex.map((val) => mapRange(val, minMaxY.min, minMaxY.max, 0, 1));

    const finalTexCoords = [];

    for (let i = 0; i < normalizedTexX.length; i += 1)
    {
        finalTexCoords.push(normalizedTexX[i], 1.0 - normalizedTexY[i]);
    }

    return finalTexCoords;
}

function createMesh(meshPoints)
{
    geom.clear();
    geom.vertices = meshPoints;

    if (inCalculateUV.get())
    {
        const texCoords = calculateUV(meshPoints);
        geom.setTexCoords(texCoords);
    }
    else
    {
        geom.setTexCoords([]);
    }

    geom.calculateNormals();

    for (let i = 0; i < geom.vertexNormals.length; i += 3)
    {
        geom.vertexNormals[i + 2] *= -1;
    }

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
    // TODO: calc indices ? optimize mesh poitns
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
        op.setUiError("noBuffer", null);

        if (!(audioBuffer instanceof AudioBuffer)) return;
    }
    else op.setUiError("noBuffer", "You need to connect the \"Audio Buffer\" input for this op to work!", 0);

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

        let makeMono = audioBuffer.numberOfChannels < 2; // TODO: If we make this a parameter, we have to check if the audio actually is stereo

        const peaks = webaudioPeaks(audioBuffer, samplesPerPixel, makeMono);

        // because we extract mono peaks we just access [0] here
        const typedArr = peaks.data[0];
        const regularArr = Array.prototype.slice.call(typedArr);

        const normalizedArray = [];
        normalizedArray.length = regularArr.length;

        const minMax = findMinMax(regularArr);

        for (let i = 0; i < regularArr.length; i += 1)
        {
            normalizedArray[i] = mapRange(regularArr[i], minMax.min, minMax.max, -1, 1);
        }

        // currently the array contains values like this: [y1top, y1bottom, y2top, ...]
        // we want it to be: [y1top, y2top, ..., y2bottom, y1bottom]

        const resortedArr = [];

        // to center the waveform around the corrdinate origin, we need to offset its position

        let offset = 0;
        let width = widthPort.get();

        if (centerPort.get()) offset = 1;

        for (var i = 1; i < normalizedArray.length; i += 2)
        {
            const xCoord = i / normalizedArray.length;
            const yCoord = normalizedArray[i];

            resortedArr.push(xCoord - offset, yCoord, 0);
        }

        const minX = resortedArr[0];
        const maxX = resortedArr[resortedArr.length - 3];

        if (showBottomHalfPort.get())
        {
            for (var i = normalizedArray.length - 2; i >= 0; i -= 2)
            {
                const xCoord = i / regularArr.length;
                const yCoord = normalizedArray[i];
                resortedArr.push(xCoord - offset, yCoord, 0);
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

        for (let i = 0; i < resortedArr.length; i += 3)
        {
            resortedArr[i] = mapRange(resortedArr[i], minX, maxX, toMin, toMax);
        }

        // resortedArr now looks like: [yTop0, yTop1, ..., yBottom1, yBottom0]
        const meshPoints = createMeshPoints(resortedArr);
        createMesh(meshPoints);
    }
    else
    {
        geometryPort.set(null);
        if (geom) geom.clear();
        if (mesh)
        {
            mesh.dispose();
            mesh = null;
        }
    }
}

function mapRange(value, inMin, inMax, outMin, outMax)
{
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
