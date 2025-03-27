const
    exe = op.inTrigger("exe"),
    geom = op.inObject("geom", null, "geometry"),
    inScale = op.inValue("Scale", 1),
    doLimit = op.inValueBool("Limit Instances", false),
    inLimit = op.inValueInt("Limit", 100),
    inTranslates = op.inArray("positions", 3),
    inScales = op.inArray("Scale Array", 3),
    inRot = op.inArray("Rotations", 3),
    inRotMeth = op.inSwitch("Rotation Type", ["Euler", "Quaternions", "Normals"], "Euler"),

    inBillboarding = op.inSwitch("Billboarding", ["Off", "Spherical", "Cylindrical"], "Off"),

    inBlendMode = op.inSwitch("Material blend mode", ["Multiply", "Add", "Normal"], "Multiply"),
    inColor = op.inArray("Colors", 4),
    inTexCoords = op.inArray("TexCoords", 4),
    outTrigger = op.outTrigger("Trigger Out"),
    outNum = op.outNumber("Num");

op.setPortGroup("Limit Number of Instances", [inLimit, doLimit]);
op.setPortGroup("Parameters", [inScales, inRot, inTranslates, inRotMeth]);
op.toWorkPortsNeedToBeLinked(geom);
op.toWorkPortsNeedToBeLinked(exe);

geom.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
const m = mat4.create();
let
    matrixArray = new Float32Array(1),
    instColorArray = new Float32Array(1),
    instTexcoordArray = new Float32Array(1),
    mesh = null,
    recalc = true,
    num = 0,
    arrayChangedColor = true,
    arrayChangedTexcoords = true,
    arrayChangedTrans = true;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "title": op.name,
    "priority": -2,
    "srcHeadVert": attachments.instancer_head_vert,
    "srcBodyVert": attachments.instancer_body_vert
});

mod.addModule({
    "name": "MODULE_VERTEX_MODELVIEW",
    "title": op.name + "_billboard",
    "srcBodyVert": attachments.billboard_vert
});

mod.addModule({
    "name": "MODULE_COLOR",
    "priority": -2,
    "title": op.name,
    "srcHeadFrag": attachments.instancer_head_frag,
    "srcBodyFrag": attachments.instancer_body_frag,
});

mod.addUniformVert("f", "MOD_scale", inScale);

let needsUpdateDefines = true;

inBlendMode.onChange = () => { needsUpdateDefines = true; };

doLimit.onChange = updateLimit;
exe.onTriggered = doRender;
exe.onLinkChanged = function ()
{
    if (!exe.isLinked()) removeModule();
};

updateLimit();

inRot.onChange =
inScales.onChange =
inTranslates.onChange =
inRotMeth.onChange =
    function ()
    {
        arrayChangedTrans = true;
        recalc = true;
    };

inBillboarding.onChange =
inTexCoords.onChange = function ()
{
    arrayChangedTexcoords = true;
    recalc = true;
    needsUpdateDefines = true;
};

inColor.onChange = function ()
{
    arrayChangedColor = true;
    recalc = true;
    needsUpdateDefines = true;
};

function reset()
{
    arrayChangedColor = true,
    arrayChangedTrans = true;
    recalc = true;
}

function updateDefines()
{
    mod.toggleDefine("BILLBOARDING", inBillboarding.get() != "Off");
    mod.toggleDefine("BILLBOARDING_CYLINDRIC", inBillboarding.get() == "Cylindrical");

    mod.toggleDefine("COLORIZE_INSTANCES", inColor.get());
    mod.toggleDefine("TEXCOORDS_INSTANCES", inTexCoords.get());
    mod.toggleDefine("BLEND_MODE_MULTIPLY", inBlendMode.get() === "Multiply");
    mod.toggleDefine("BLEND_MODE_ADD", inBlendMode.get() === "Add");
    mod.toggleDefine("BLEND_MODE_NONE", inBlendMode.get() === "Normal");
    needsUpdateDefines = false;
}

geom.onChange = function ()
{
    if (mesh)mesh.dispose();
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

}

function setupArray()
{
    if (!mesh) return;

    let transforms = inTranslates.get();
    if (!transforms) transforms = [0, 0, 0];

    num = Math.floor(transforms.length / 3);

    if (needsUpdateDefines)updateDefines();

    const colArr = inColor.get();
    const tcArr = inTexCoords.get();
    const scales = inScales.get();
    const useQuats = inRotMeth.get() == "Quaternions";
    const useEuler = inRotMeth.get() == "Euler";
    const useNormals = inRotMeth.get() == "Normals";

    let stride = 3;
    if (useQuats)stride = 4;
    inRot.setUiAttribs({ "stride": stride });

    if (scales && scales.length != transforms.length) op.setUiError("lengthScales", "Scales array has wrong length");
    else op.setUiError("lengthScales", null);

    if (matrixArray.length != num * 16) matrixArray = new Float32Array(num * 16);
    if (instColorArray.length != num * 4)
    {
        arrayChangedColor = true;
        instColorArray = new Float32Array(num * 4);
    }
    if (instTexcoordArray.length != num * 4)
    {
        arrayChangedTexcoords = true;
        instTexcoordArray = new Float32Array(num * 4);
    }

    const rotArr = inRot.get();

    for (let i = 0; i < num; i++)
    {
        mat4.identity(m);

        mat4.translate(m, m, [
            transforms[i * 3],
            transforms[i * 3 + 1],
            transforms[i * 3 + 2]
        ]);

        if (rotArr)
        {
            if (useQuats)
            {
                const mq = mat4.create();
                const q = [rotArr[i * 4 + 0], rotArr[i * 4 + 1], rotArr[i * 4 + 2], rotArr[i * 4 + 3]];
                quat.normalize(q, q);
                mat4.fromQuat(mq, q);
                mat4.mul(m, m, mq);
            }
            else
            if (useNormals)
            {
                const n = [rotArr[i * 3 + 0], rotArr[i * 3 + 1], rotArr[i * 3 + 2]];
                const up = [1, 0, 0];
                const v = vec3.create();

                vec3.cross(v, up, n);
                vec3.normalize(v, v);

                const angle = Math.acos(vec3.dot(up, n));
                const q = quat.create();

                quat.setAxisAngle(q, v, angle);
                quat.normalize(q, q);

                const mq = mat4.create();

                mat4.fromQuat(mq, q);
                mat4.mul(m, m, mq);
            }
            if (useEuler)
            {
                mat4.rotateX(m, m, rotArr[i * 3 + 0] * CGL.DEG2RAD);
                mat4.rotateY(m, m, rotArr[i * 3 + 1] * CGL.DEG2RAD);
                mat4.rotateZ(m, m, rotArr[i * 3 + 2] * CGL.DEG2RAD);
            }
        }

        if (arrayChangedColor && colArr)
        {
            instColorArray[i * 4 + 0] = colArr[i * 4 + 0];
            instColorArray[i * 4 + 1] = colArr[i * 4 + 1];
            instColorArray[i * 4 + 2] = colArr[i * 4 + 2];
            instColorArray[i * 4 + 3] = colArr[i * 4 + 3];
        }

        if (arrayChangedTexcoords && tcArr)
        {
            instTexcoordArray[i * 4 + 0] = tcArr[i * 4 + 0];
            instTexcoordArray[i * 4 + 1] = tcArr[i * 4 + 1];
            instTexcoordArray[i * 4 + 2] = tcArr[i * 4 + 2];
            instTexcoordArray[i * 4 + 3] = tcArr[i * 4 + 3];
        }

        if (scales && scales.length > i) mat4.scale(m, m, [scales[i * 3], scales[i * 3 + 1], scales[i * 3 + 2]]);
        else mat4.scale(m, m, [1, 1, 1]);

        for (let a = 0; a < 16; a++) matrixArray[i * 16 + a] = m[a];
    }

    // mesh.numInstances = num;
    mesh.setNumInstances(num);

    if (arrayChangedTrans) mesh.addAttribute("instMat", matrixArray, 16);
    if (arrayChangedColor) mesh.addAttribute("instColor", instColorArray, 4, { "instanced": true });
    if (arrayChangedTexcoords) mesh.addAttribute("instTexCoords", instTexcoordArray, 4, { "instanced": true });

    mod.toggleDefine("HAS_TEXCOORDS", tcArr);
    mod.toggleDefine("HAS_COLORS", colArr);

    arrayChangedColor = false;
    recalc = false;
}

function updateLimit()
{
    inLimit.setUiAttribs({ "greyout": !doLimit.get() });
}

function doRender()
{
    if (!mesh) return;
    if (recalc) setupArray();
    op.checkGraphicsApi();

    mod.bind();

    if (doLimit.get()) mesh.setNumInstances(Math.min(num, inLimit.get()));
    else mesh.setNumInstances(num);

    outNum.set(mesh.numInstances);

    if (mesh.numInstances > 0) mesh.render(cgl.getShader());

    outTrigger.trigger();

    mod.unbind();
}
