const
    render = op.inTrigger("Render"),
    inDraw = op.inValueBool("draw", true),
    inNum = op.inValueInt("Num", 100),
    inGeomSurface = op.inObject("Geom Surface"),
    // inGeom = op.inObject("Geometry"),
    inDistribution = op.inValueSelect("Distribution", ["Vertex", "Triangle Center", "Triangle Side", "Random Triangle Point"], "Vertex"),
    inVariety = op.inValueSelect("Selection", ["Random", "Sequential"], "Random"),
    seed = op.inValueFloat("Random Seed"),
    inSizeMin = op.inValueSlider("Size min", 1.0),
    inSizeMax = op.inValueSlider("Size max", 1.0),
    inDoLimit = op.inValueBool("Limit", false),
    inLimit = op.inValueInt("Limit Num", 0),
    inRotateRandom = op.inValueBool("Random Rotate", true),
    outNext = op.outTrigger("Next"),
    outArrPositions = op.outArray("Positions", 3),
    outArrScale = op.outArray("Scale", 3),
    outArrRotations = op.outArray("Quaternions", 4);
const cgl = op.patch.cgl;
const mod = null;
let recalc = true;

let matrixArray = new Float32Array(1);
const m = mat4.create();
const qAxis = vec3.create();

op.setPortGroup("Size", [inSizeMin, inSizeMax]);
op.setPortGroup("Distribution", [inDistribution, inVariety, seed]);

inDistribution.onChange =
    seed.onChange =
    inNum.onChange =
    inRotateRandom.onChange =
    inSizeMin.onChange =
    inSizeMax.onChange =
    inVariety.onChange =
    inGeomSurface.onChange = reset;
render.onTriggered = doRender;

const arrPositions = [];
const arrRotations = [];
const arrScale = [];

function uniqueIndices(oldCount, newCount, randomize)
{
    function fisherYatesShuffle(array)
    {
        Math.randomSeed = seed.get();
        let i = 0;
        let j = 0;
        let temp = null;

        for (i = array.length - 1; i > 0; i -= 1)
        {
            j = Math.floor(Math.seededRandom() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    const arr = [];
    arr.length = newCount;

    if (newCount > oldCount)
    {
        arr.length = newCount;
        for (let i = 0; i < newCount; i++) arr[i] = i % (oldCount);
    }
    else
    {
        arr.length = oldCount;
        for (let i = 0; i < oldCount; i++) arr[i] = i;
    }

    if (randomize)fisherYatesShuffle(arr);
    return arr;
}

function getEuler(out, quat)
{
    const x = quat[0],
        y = quat[1],
        z = quat[2],
        w = quat[3],
        x2 = x * x,
        y2 = y * y,
        z2 = z * z,
        w2 = w * w;
    const unit = x2 + y2 + z2 + w2;
    const test = x * w - y * z;
    if (test > 0.499995 * unit)
    { // TODO: Use glmatrix.EPSILON
    // singularity at the north pole
        out[0] = Math.PI / 2;
        out[1] = 2 * Math.atan2(y, x);
        out[2] = 0;
    }
    else if (test < -0.499995 * unit)
    { // TODO: Use glmatrix.EPSILON
    // singularity at the south pole
        out[0] = -Math.PI / 2;
        out[1] = 2 * Math.atan2(y, x);
        out[2] = 0;
    }
    else
    {
        out[0] = Math.asin(2 * (x * z - w * y));
        out[1] = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2));
        out[2] = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
    }
    // TODO: Return them as degrees and not as radians
    return out;
}

function setup()
{
    recalc = false;

    op.toWorkPortsNeedToBeLinkedReset();

    // if (inDraw.get())
    // {
    //     op.toWorkPortsNeedToBeLinked(inGeom);
    // }
    const geom = inGeomSurface.get();
    const num = Math.abs(Math.floor(inNum.get()));
    const m = mat4.create();
    const q = quat.create();
    const vm2 = vec3.create();
    const qMat = mat4.create();
    const norm = vec3.create();

    if (!geom) return;

    Math.randomSeed = seed.get();

    const DISTMODE_VERTEX = 0;
    const DISTMODE_TRIANGLE_CENTER = 1;
    const DISTMODE_TRIANGLE_SIDE = 2;
    const DISTMODE_TRIANGLE_RANDOM = 3;

    let distMode = 0;
    if (inDistribution.get() == "Triangle Center")distMode = DISTMODE_TRIANGLE_CENTER;
    else if (inDistribution.get() == "Triangle Side")distMode = DISTMODE_TRIANGLE_SIDE;
    else if (inDistribution.get() == "Random Triangle Point")distMode = DISTMODE_TRIANGLE_RANDOM;

    if (matrixArray.length != num * 16) matrixArray = new Float32Array(num * 16);

    let faces = geom.verticesIndices;
    if (!geom.isIndexed())
    {
        faces = [];
        for (let i = 0; i < geom.vertices.length / 3; i++) faces[i] = i;
    }

    const indices = uniqueIndices(faces.length / 3, num, inVariety.get() == "Random");

    arrScale.length = arrPositions.length = num * 3;
    arrRotations.length = num * 4;

    for (let i = 0; i < num; i++)
    {
        const index = indices[i];
        const index3 = index * 3;

        let px = 0;
        let py = 0;
        let pz = 0;

        mat4.identity(m);

        let nx = geom.vertexNormals[faces[index3] * 3 + 0];
        let ny = geom.vertexNormals[faces[index3] * 3 + 1];
        let nz = geom.vertexNormals[faces[index3] * 3 + 2];

        if (distMode == DISTMODE_VERTEX)
        {
            px = geom.vertices[faces[index3] * 3 + 0];
            py = geom.vertices[faces[index3] * 3 + 1];
            pz = geom.vertices[faces[index3] * 3 + 2];
        }
        else if (distMode == DISTMODE_TRIANGLE_CENTER)
        {
            px = (geom.vertices[faces[index3] * 3 + 0] + geom.vertices[faces[index3 + 1] * 3 + 0] + geom.vertices[faces[index3 + 2] * 3 + 0]) / 3;
            py = (geom.vertices[faces[index3] * 3 + 1] + geom.vertices[faces[index3 + 1] * 3 + 1] + geom.vertices[faces[index3 + 2] * 3 + 1]) / 3;
            pz = (geom.vertices[faces[index3] * 3 + 2] + geom.vertices[faces[index3 + 1] * 3 + 2] + geom.vertices[faces[index3 + 2] * 3 + 2]) / 3;

            nx = (geom.vertexNormals[faces[index3] * 3 + 0] + geom.vertexNormals[faces[index3 + 1] * 3 + 0] + geom.vertexNormals[faces[index3 + 2] * 3 + 0]) / 3;
            ny = (geom.vertexNormals[faces[index3] * 3 + 1] + geom.vertexNormals[faces[index3 + 1] * 3 + 1] + geom.vertexNormals[faces[index3 + 2] * 3 + 1]) / 3;
            nz = (geom.vertexNormals[faces[index3] * 3 + 2] + geom.vertexNormals[faces[index3 + 1] * 3 + 2] + geom.vertexNormals[faces[index3 + 2] * 3 + 2]) / 3;
        }
        else if (distMode == DISTMODE_TRIANGLE_SIDE)
        {
            const which = Math.round(Math.seededRandom() * 3.0);
            const whichA = which;
            let whichB = which + 1;
            if (whichB > 2)whichB = 0;

            px = (geom.vertices[faces[index3 + whichA] * 3 + 0] + geom.vertices[faces[index3 + whichB] * 3 + 0]) / 2;
            py = (geom.vertices[faces[index3 + whichA] * 3 + 1] + geom.vertices[faces[index3 + whichB] * 3 + 1]) / 2;
            pz = (geom.vertices[faces[index3 + whichA] * 3 + 2] + geom.vertices[faces[index3 + whichB] * 3 + 2]) / 2;
        }
        else if (distMode == DISTMODE_TRIANGLE_RANDOM)
        {
            let r = Math.seededRandom();
            const p1x = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 0]) * 3 + 0], geom.vertices[(faces[index3 + 1]) * 3 + 0]);
            const p1y = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 0]) * 3 + 1], geom.vertices[(faces[index3 + 1]) * 3 + 1]);
            const p1z = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 0]) * 3 + 2], geom.vertices[(faces[index3 + 1]) * 3 + 2]);

            const n1x = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 0]) * 3 + 0], geom.vertexNormals[(faces[index3 + 1]) * 3 + 0]);
            const n1y = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 0]) * 3 + 1], geom.vertexNormals[(faces[index3 + 1]) * 3 + 1]);
            const n1z = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 0]) * 3 + 2], geom.vertexNormals[(faces[index3 + 1]) * 3 + 2]);

            r = Math.seededRandom();
            const p2x = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 1]) * 3 + 0], geom.vertices[(faces[index3 + 2]) * 3 + 0]);
            const p2y = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 1]) * 3 + 1], geom.vertices[(faces[index3 + 2]) * 3 + 1]);
            const p2z = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 1]) * 3 + 2], geom.vertices[(faces[index3 + 2]) * 3 + 2]);

            const n2x = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 1]) * 3 + 0], geom.vertexNormals[(faces[index3 + 2]) * 3 + 0]);
            const n2y = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 1]) * 3 + 1], geom.vertexNormals[(faces[index3 + 2]) * 3 + 1]);
            const n2z = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 1]) * 3 + 2], geom.vertexNormals[(faces[index3 + 2]) * 3 + 2]);

            r = Math.seededRandom();
            const p3x = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 2]) * 3 + 0], geom.vertices[(faces[index3 + 0]) * 3 + 0]);
            const p3y = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 2]) * 3 + 1], geom.vertices[(faces[index3 + 0]) * 3 + 1]);
            const p3z = CABLES.map(r, 0, 1, geom.vertices[(faces[index3 + 2]) * 3 + 2], geom.vertices[(faces[index3 + 0]) * 3 + 2]);

            const n3x = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 2]) * 3 + 0], geom.vertexNormals[(faces[index3 + 0]) * 3 + 0]);
            const n3y = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 2]) * 3 + 1], geom.vertexNormals[(faces[index3 + 0]) * 3 + 1]);
            const n3z = CABLES.map(r, 0, 1, geom.vertexNormals[(faces[index3 + 2]) * 3 + 2], geom.vertexNormals[(faces[index3 + 0]) * 3 + 2]);

            px = (p1x + p2x + p3x) / 3;
            py = (p1y + p2y + p3y) / 3;
            pz = (p1z + p2z + p3z) / 3;

            nx = (n1x + n2x + n3x) / 3;
            ny = (n1y + n2y + n3y) / 3;
            nz = (n1z + n2z + n3z) / 3;
        }

        arrPositions[i * 3 + 0] = px;
        arrPositions[i * 3 + 1] = py;
        arrPositions[i * 3 + 2] = pz;
        mat4.translate(m, m, [px, py, pz]);

        // rotate to normal direction
        vec3.set(norm, nx, ny, nz);
        vec3.set(vm2, 1, 0, 0);
        quat.rotationTo(q, vm2, norm);

        // mat4.fromQuat(qMat, q);
        // mat4.mul(m,m,qMat);

        // random rotate around up axis
        if (inRotateRandom.get())
        {
            const mr = mat4.create();
            // let qbase=quat.create();
            quat.rotateX(q, q, Math.seededRandom() * 360 * CGL.DEG2RAD);
            // mat4.fromQuat(mr,qbase);
            // mat4.mul(m,m,mr);
        }

        // rotate -90 degree
        const mr2 = mat4.create();
        // let qbase2=quat.create();
        quat.rotateZ(q, q, -90 * CGL.DEG2RAD);
        mat4.fromQuat(mr2, q);
        mat4.mul(m, m, mr2);

        // scale
        if (inSizeMin.get() != 1.0 || inSizeMax != 1.0)
        {
            const sc = inSizeMin.get() + (Math.seededRandom() * (inSizeMax.get() - inSizeMin.get()));
            mat4.scale(m, m, [sc, sc, sc]);

            arrScale[i * 3 + 0] =
            arrScale[i * 3 + 1] =
            arrScale[i * 3 + 2] = sc;
        }

        // //quaternion to euler, KINDA works, but not really :/
        // let finalq=q;//
        // let finalq=quat.create();
        // mat4.getRotation(finalq,m);

        // function clamp(v)
        // {
        //     return Math.min(1,Math.max(-1,v) ) ;
        // }

        // let yaw = Math.atan2(2.0*(finalq[1]*finalq[2] + finalq[3]*finalq[0]), finalq[3]*finalq[3] - finalq[0]*finalq[0] - finalq[1]*finalq[1] + finalq[2]*finalq[2]);
        // let pitch = Math.asin( clamp( -2.0*(finalq[0]*finalq[2] - finalq[3]*finalq[1])));
        // let roll = Math.atan2(2.0*(finalq[0]*finalq[1] + finalq[3]*finalq[2]), finalq[3]*finalq[3] + finalq[0]*finalq[0] - finalq[1]*finalq[1] - finalq[2]*finalq[2]);

        // arrRotations[i*3+0]=360-(pitch*CGL.RAD2DEG);
        // arrRotations[i*3+1]=360-(yaw*CGL.RAD2DEG);
        // arrRotations[i*3+2]=(roll*CGL.RAD2DEG);

        const rotDeg = vec3.create();
        // quat.getAxisAngle(rotDeg,finalq);
        getEuler(rotDeg, q);

        arrRotations[i * 4 + 0] = q[0];
        arrRotations[i * 4 + 1] = q[1];
        arrRotations[i * 4 + 2] = q[2];
        arrRotations[i * 4 + 3] = q[3];

        // save
        for (let a = 0; a < 16; a++)
        {
            matrixArray[i * 16 + a] = m[a];
        }
    }

    outArrScale.set(null);
    outArrScale.set(arrScale);

    outArrRotations.set(null);
    outArrRotations.set(arrRotations);

    outArrPositions.set(null);
    outArrPositions.set(arrPositions);
}

function reset()
{
    recalc = true;
}

function doRender()
{
    if (recalc)setup();
    recalc = false;

    outNext.trigger();
}
