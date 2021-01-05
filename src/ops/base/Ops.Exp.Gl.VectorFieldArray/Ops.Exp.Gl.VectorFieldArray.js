const cgl = op.patch.cgl;

let exe = op.inTrigger("exe");
let geom = op.inObject("geom");
geom.ignoreValueSerialize = true;

let tex = op.inTexture("Texture");

let numColumns = op.inValue("Columns", 100);
let numRows = op.inValue("Rows", 100);
let spacingColumns = op.inValue("Spacing Columns", 1);
let spacingRows = op.inValue("Spacing Rows", 1);
let doCenter = op.inValueBool("Center", true);

let transRotate = op.inValueBool("Rotate", true);
let transScale = op.inValueBool("Scale", false);
let transTransZ = op.inValueBool("Translate Z", false);

transTransZ.onChange = updateTransforms;
transRotate.onChange = updateTransforms;
transScale.onChange = updateTransforms;

function updateTransforms()
{
    if (!shader) return;
    if (transRotate.get())shader.define("TRANS_ROTATE");
    else shader.removeDefine("TRANS_ROTATE");

    if (transScale.get())shader.define("TRANS_SCALE");
    else shader.removeDefine("TRANS_SCALE");

    if (transTransZ.get())shader.define("TRANS_TRANS_Z");
    else shader.removeDefine("TRANS_TRANS_Z");
}

let transformations = [];
let mod = null;
let mesh = null;
var shader = null;
let uniDoInstancing = null;
let uniSpaceX = null;
let uniSpaceY = null;
let recalc = true;

numRows.onChange = reset;
numColumns.onChange = reset;
doCenter.onChange = reset;
spacingColumns.onChange = reset;
spacingRows.onChange = reset;

geom.onChange = reset;
exe.onTriggered = doRender;
exe.onLinkChanged = removeModule;

let srcHeadVert = ""
    .endl() + "UNI float do_instancing;"
    .endl() + "UNI sampler2D {{mod}}field;"

    .endl() + "UNI float {{mod}}spaceX;"
    .endl() + "UNI float {{mod}}spaceY;"
    .endl() + "UNI float {{mod}}rows;"
    .endl() + "UNI float {{mod}}cols;"

    .endl() + "#ifdef INSTANCING"
    .endl() + "   IN mat4 instMat;"
    .endl() + "   OUT mat4 instModelMat;"
    .endl() + "#endif"

    .endl() + "mat4 rotationMatrix(vec3 axis, float angle)"
    .endl() + "{"
    .endl() + "    axis = normalize(axis);"
    .endl() + "    float s = sin(angle);"
    .endl() + "    float c = cos(angle);"
    .endl() + "    float oc = 1.0 - c;"

    .endl() + "    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,"
    .endl() + "                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,"
    .endl() + "                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,"
    .endl() + "                0.0,                                0.0,                                0.0,                                1.0);"
    .endl() + "}";

let srcBodyVert = ""
    .endl() + "#ifdef INSTANCING"
    // .endl()+'   if( do_instancing==1.0 )'
    .endl() + "   {"
    .endl() + "       instModelMat=instMat;"
    .endl() + "       float tx=(instModelMat[3][0]) / {{mod}}cols;"
    .endl() + "       float ty=(instModelMat[3][1]) / {{mod}}rows;"
    .endl() + "       instModelMat[3][0]*={{mod}}spaceX;"
    .endl() + "       instModelMat[3][1]*={{mod}}spaceY;"
    .endl() + "       vec4 instCol = texture2D( {{mod}}field, vec2(tx,ty) );"

    .endl() + "       #ifdef TRANS_ROTATE"
    .endl() + "           instModelMat*=rotationMatrix(vec3(0.0,0.0,1.0),instCol.r*3.1415926535897932384626433832795*2.0);"
    .endl() + "       #endif"

    .endl() + "       #ifdef TRANS_SCALE"
    .endl() + "           pos.rgb*=instCol.r;"
    .endl() + "       #endif"

    .endl() + "       #ifdef TRANS_TRANS_Z"
    .endl() + "           pos.z+=instCol.r;"
    .endl() + "       #endif"

// .endl()+'       pos*=instCol.r;'
    .endl() + "       mMatrix=mMatrix * instModelMat;"
    .endl() + "   }"
    .endl() + "#endif"
    .endl();

function reset()
{
    recalc = true;
}

function prepare()
{
    if (geom.get())
    {
        calc();

        let num = transformations.length;
        let arrs = [].concat.apply([], transformations);

        let matrices = new Float32Array(arrs);

        mesh = new CGL.Mesh(cgl, geom.get());
        mesh.numInstances = num;

        mesh.addAttribute("instMat", matrices, 16);

        recalc = false;
    }
}

function removeModule()
{
    if (shader && mod)
    {
        shader.removeModule(mod);
        shader = null;
    }
}

function doRender()
{
    if (recalc)prepare();
    if (mesh)
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
                        "name": "MODULE_VERTEX_POSITION",
                        "srcHeadVert": srcHeadVert,
                        "srcBodyVert": srcBodyVert
                    });

                shader.define("INSTANCING");
                op.uniDoInstancing = new CGL.Uniform(shader, "f", "do_instancing", 1);
                op.uniSpaceX = new CGL.Uniform(shader, "f", mod.prefix + "spaceX", spacingColumns);
                op.uniSpaceY = new CGL.Uniform(shader, "f", mod.prefix + "spaceY", spacingRows);
                op.uniTexture = new CGL.Uniform(shader, "t", mod.prefix + "field", 5);
                op.uniCols = new CGL.Uniform(shader, "f", mod.prefix + "cols", numColumns);
                op.uniRows = new CGL.Uniform(shader, "f", mod.prefix + "rows", numRows);

                updateTransforms();
            }
            else
            {
                op.uniDoInstancing = shader.getUniform("do_instancing");
            }
        }

        // if(uniSpaceX)
        // {
        //     uniSpaceY.setValue(spacingRows.get());
        //     uniSpaceX.setValue(spacingColumns.get());

        //     uniCols.setValue(numColumns.get());
        //     uniRows.setValue(numRows.get());

        // }

        if (tex.get())
            cgl.setTexture(5, tex.get().tex);

        op.uniDoInstancing.setValue(1);
        mesh.render(shader);
        op.uniDoInstancing.setValue(0);
    }
    else
    {
        prepare();
    }
}

function calc()
{
    let m = mat4.create();
    let cols = Math.round(numColumns.get());
    let rows = Math.round(numRows.get());
    if (cols <= 0)cols = 1;
    if (rows <= 0)rows = 1;

    let distX = spacingColumns.get();
    let distY = spacingRows.get();

    let centerX = 0;
    let centerY = 0;
    if (doCenter.get())
    {
        centerX = cols * (spacingColumns.get() / 2);
        centerY = rows * (spacingRows.get() / 2);
    }

    transformations.length = cols * rows;

    for (let x = 0; x < cols; x++)
    {
        for (let y = 0; y < rows; y++)
        {
            mat4.identity(m);
            mat4.translate(m, m, [x - centerX, y - centerY, 0]);
            transformations[x + y * cols] = Array.prototype.slice.call(m);
        }
    }

    op.log("reset", transformations.length, cols, rows);
}
