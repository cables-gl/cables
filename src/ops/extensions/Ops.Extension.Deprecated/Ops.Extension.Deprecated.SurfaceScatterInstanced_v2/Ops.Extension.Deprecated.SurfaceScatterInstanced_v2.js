const
    render = op.inTrigger("Render"),
    inGeomSurface = op.inObject("Geom Surface"),
    geom = op.inObject("Geometry"),
    inDistribution = op.inValueSelect("Distribution", ["Vertex", "Triangle Center", "Triangle Side"], "Vertex"),
    inVariety = op.inValueSelect("Selection", ["Random", "Sequential"], "Random"),
    inNum = op.inValueInt("Num", 100),
    inSizeMin = op.inValueSlider("Size min", 1.0),
    inSizeMax = op.inValueSlider("Size max", 1.0),
    inRotateRandom = op.inValueBool("Random Rotate", true),
    seed = op.inValueFloat("Random Seed");

let mod = null;
let mesh = null;
let shader = null;
let uniDoInstancing = null;
let recalc = true;
let cgl = op.patch.cgl;

let matrixArray = new Float32Array(1);
let m = mat4.create();

inDistribution.onChange =
    seed.onChange =
    inNum.onChange =
    inRotateRandom.onChange =
    inSizeMin.onChange =
    inSizeMax.onChange =
    inVariety.onChange =
    inGeomSurface.onChange = reset;
render.onTriggered = doRender;
render.onLinkChanged = removeModule;

function uniqueIndices(oldCount, newCount, randomize)
{
    function fisherYatesShuffle(array)
    {
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

    let arr = [];
    arr.length = oldCount;
    for (let i = 0; i < oldCount; i++) arr[i] = i;
    if (randomize)fisherYatesShuffle(arr);
    arr.length = newCount;
    return arr;
}

function setup()
{
    if (!mesh) return;
    let geom = inGeomSurface.get();
    let num = Math.abs(Math.floor(inNum.get()));
    let m = mat4.create();
    let q = quat.create();
    var vm2 = vec3.create();
    let qMat = mat4.create();
    let norm = vec3.create();

    if (!geom) return;

    Math.randomSeed = seed.get();

    let DISTMODE_VERTEX = 0;
    let DISTMODE_TRIANGLE_CENTER = 1;
    let DISTMODE_TRIANGLE_SIDE = 2;

    let distMode = 0;
    if (inDistribution.get() == "Triangle Center")distMode = DISTMODE_TRIANGLE_CENTER;
    if (inDistribution.get() == "Triangle Side")distMode = 2;

    if (matrixArray.length != num * 16) matrixArray = new Float32Array(num * 16);

    if (geom.isIndexed())
    {
        let faces = geom.verticesIndices;
        let indices = uniqueIndices(faces.length / 3, num, inVariety.get() == "Random");

        for (let i = 0; i < num; i++)
        {
            let index = indices[i];

            mat4.identity(m);

            if (distMode == DISTMODE_VERTEX)
            {
                mat4.translate(m, m,
                    [
                        geom.vertices[faces[index * 3] * 3 + 0],
                        geom.vertices[faces[index * 3] * 3 + 1],
                        geom.vertices[faces[index * 3] * 3 + 2]
                    ]);
            }
            else if (distMode == DISTMODE_TRIANGLE_CENTER)
            {
                mat4.translate(m, m,
                    [
                        (geom.vertices[faces[index * 3] * 3 + 0] + geom.vertices[faces[index * 3 + 1] * 3 + 0] + geom.vertices[faces[index * 3 + 2] * 3 + 0]) / 3,
                        (geom.vertices[faces[index * 3] * 3 + 1] + geom.vertices[faces[index * 3 + 1] * 3 + 1] + geom.vertices[faces[index * 3 + 2] * 3 + 1]) / 3,
                        (geom.vertices[faces[index * 3] * 3 + 2] + geom.vertices[faces[index * 3 + 1] * 3 + 2] + geom.vertices[faces[index * 3 + 2] * 3 + 2]) / 3,

                    ]);
            }
            else if (distMode == DISTMODE_TRIANGLE_SIDE)
            {
                let which = Math.round(Math.seededRandom() * 3.0);
                let whichA = which;
                let whichB = which + 1;
                if (whichB > 2)whichB = 0;

                mat4.translate(m, m,
                    [
                        (geom.vertices[faces[index * 3 + whichA] * 3 + 0] + geom.vertices[faces[index * 3 + whichB] * 3 + 0]) / 2,
                        (geom.vertices[faces[index * 3 + whichA] * 3 + 1] + geom.vertices[faces[index * 3 + whichB] * 3 + 1]) / 2,
                        (geom.vertices[faces[index * 3 + whichA] * 3 + 2] + geom.vertices[faces[index * 3 + whichB] * 3 + 2]) / 2,
                    ]);
            }

            // rotate to normal direction
            vec3.set(norm,
                geom.vertexNormals[geom.verticesIndices[index * 3] * 3 + 0],
                geom.vertexNormals[geom.verticesIndices[index * 3] * 3 + 1],
                geom.vertexNormals[geom.verticesIndices[index * 3] * 3 + 2]
            );

            var vm2 = vec3.create();
            vec3.set(vm2, 1, 0, 0);
            quat.rotationTo(q, vm2, norm);

            mat4.fromQuat(qMat, q);
            mat4.mul(m, m, qMat);

            // random rotate around up axis
            if (inRotateRandom.get())
            {
                let mr = mat4.create();
                let qbase = quat.create();
                quat.rotateX(qbase, qbase, Math.seededRandom() * 360 * CGL.DEG2RAD);
                mat4.fromQuat(mr, qbase);
                mat4.mul(m, m, mr);
            }

            // rotate -90 degree
            let mr2 = mat4.create();
            let qbase2 = quat.create();
            quat.rotateZ(qbase2, qbase2, -90 * CGL.DEG2RAD);
            mat4.fromQuat(mr2, qbase2);
            mat4.mul(m, m, mr2);

            // scale
            if (inSizeMin.get() != 1.0 || inSizeMax != 1.0)
            {
                let sc = inSizeMin.get() + (Math.seededRandom() * (inSizeMax.get() - inSizeMin.get()));
                mat4.scale(m, m, [sc, sc, sc]);
            }

            // save
            for (let a = 0; a < 16; a++)
            {
                matrixArray[i * 16 + a] = m[a];
            }
        }
    }
    else
    {
        console.error("geom is not indexed");
    }

    if (op.patch.cgl.glVersion >= 2)
    {
        mesh.numInstances = num;
        if (num > 0)mesh.addAttribute("instMat", matrixArray, 16);
    }
    recalc = false;
    // console.log(matrixArray);
}

// // TODO: remove array3xtransformedinstanced....

// const exe=op.inTrigger("exe");

// var inTransformations=op.inArray("positions");
// var inScales=op.inArray("Scale Array");
// var inScale=op.inValue("Scale",1);
// var geom=op.inObject("geom");
// geom.ignoreValueSerialize=true;

// inTransformations.onChange=reset;
// inScales.onChange=reset;

let srcHeadVert = ""
    .endl() + "UNI float do_instancing;"
// .endl()+'UNI float MOD_scale;'

    .endl() + "#ifdef INSTANCING"
    .endl() + "   IN mat4 instMat;"
    .endl() + "   OUT mat4 instModelMat;"
    .endl() + "#endif";

let srcBodyVert = ""
    .endl() + "#ifdef INSTANCING"
    .endl() + "   if(do_instancing==1.0)"
    .endl() + "   {"
    .endl() + "       mMatrix*=instMat;"
    .endl() + "   }"
    .endl() + "#endif"
    .endl();

geom.onChange = function ()
{
    if (!geom.get())
    {
        mesh = null;
        return;
    }
    mesh = new CGL.Mesh(cgl, geom.get());
    reset();
};

function removeModule()
{
    if (shader && mod)
    {
        shader.removeDefine("INSTANCING");
        shader.removeModule(mod);
        shader = null;
    }
}

function reset()
{
    recalc = true;
}

function doRender()
{
    if (recalc)setup();
    if (!mesh) return;
    if (!inGeomSurface.get()) return;
    if (!geom.get()) return;

    if (op.patch.cgl.glVersion >= 2)
    {
        if (cgl.getShader() && cgl.getShader() != shader)
        {
            if (shader && mod)
            {
                shader.removeModule(mod);
                shader = null;
            }

            shader = cgl.getShader();
            if (!shader.hasDefine("INSTANCING"))
            {
                mod = shader.addModule(
                    {
                        "title": op.objName,
                        "name": "MODULE_VERTEX_POSITION",
                        "priority": -2,
                        "srcHeadVert": srcHeadVert,
                        "srcBodyVert": srcBodyVert
                    });

                shader.define("INSTANCING");
                uniDoInstancing = new CGL.Uniform(shader, "f", "do_instancing", 0);
            }
            else
            {
                uniDoInstancing = shader.getUniform("do_instancing");
            }
            setup();
        }

        if (mesh.numInstances > 0)
        {
            uniDoInstancing.setValue(1);
            mesh.render(shader);
            uniDoInstancing.setValue(0);
        }
    }
    else
    {
        // fallback - SLOW // should also use webgl1 extensions...

        for (let i = 0; i < matrixArray.length; i += 16)
        {
            op.patch.cgl.pushModelMatrix();

            for (let j = 0; j < 16; j++)
                m[j] = matrixArray[i + j];

            mat4.multiply(cgl.mMatrix, cgl.mMatrix, m);

            mesh.render(cgl.getShader());
            op.patch.cgl.popModelMatrix();
        }
    }
}
