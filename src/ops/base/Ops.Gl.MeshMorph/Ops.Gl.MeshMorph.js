const
    NUMGEOMS = 16,
    render = op.inTrigger("render"),
    inMethod = op.inSwitch("Method", ["Auto Anim", "Interpolate Index", "Interpolate Indices"], "Auto Anim"),
    nextGeom = op.inValueInt("Geometry"),
    duration = op.inValue("Duration", 1.0),
    inIndex = op.inFloat("Index", 0),
    inIndex2 = op.inFloat("Index 2", 0),
    inFade = op.inFloatSlider("Fade", 0),
    finished = op.outBoolNum("Finished"),
    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const inGeoms = [];
let mesh = null;
let method_autoAnim = true;
let method_manualFade = false;
let method_interpolate = false;
let method_interpolate2 = false;
let oldGeom = 0;

const anim = new CABLES.Anim();
anim.clear();
const inEase = anim.createPort(op, "Easing", updateGeom);

window.meshsequencecounter = window.meshsequencecounter || 1;
window.meshsequencecounter++;
const prfx = String.fromCharCode(97 + window.meshsequencecounter);

const srcHeadVert = ""
    .endl() + "IN vec3 " + prfx + "attrMorphTargetA;"
    .endl() + "IN vec3 " + prfx + "attrMorphTargetB;"
    .endl();

const srcBodyVert = ""
    .endl() + "  pos = vec4(" + prfx + "attrMorphTargetA * MOD_fade + " + prfx + "attrMorphTargetB * (1.0 - MOD_fade), 1. );"

    .endl();

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addUniform("f", "MOD_fade", 1);
mod.addUniform("f", "MOD_doMorph", 1);
mod.addModule({
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});

inIndex2.onChange =
    inIndex.onChange =
    nextGeom.onChange = updateGeom;
render.onTriggered = doRender;
inMethod.onChange = updateUi;
updateUi();

for (let i = 0; i < NUMGEOMS; i++)
{
    const inGeom = op.inObject("Geometry " + (i));
    inGeom.onChange = updateMeshes;
    inGeoms.push(inGeom);
}

function updateUi()
{
    method_interpolate = inMethod.get() == "Interpolate Index";
    method_autoAnim = inMethod.get() == "Auto Anim";
    method_interpolate2 = inMethod.get() == "Interpolate Indices";

    duration.setUiAttribs({ "greyout": !method_autoAnim });
    nextGeom.setUiAttribs({ "greyout": !(method_autoAnim || method_manualFade) });
    inIndex.setUiAttribs({ "greyout": !(method_interpolate || method_interpolate2) });
    inIndex2.setUiAttribs({ "greyout": !method_interpolate2 });
    inIndex2.setUiAttribs({ "greyout": !method_interpolate2 });
    inEase.setUiAttribs({ "greyout": !method_autoAnim });

    inFade.setUiAttribs({ "greyout": !(method_manualFade || method_interpolate2) });
}

function checkLength()
{
    op.setUiError("nosamelength", null);
    let oldGeomLength = 0;

    for (let i = 0; i < inGeoms.length; i++)
    {
        const geom = inGeoms[i].get();
        if (geom && geom._vertices)
        {
            if (oldGeomLength != 0 && oldGeomLength != geom._vertices.length) op.setUiError("nosamelength", "Geometries must have the same number of vertices!", 1);
            oldGeomLength = geom._vertices.length;
        }
    }
}

function updateMeshes()
{
    checkLength();
    if (mesh) return;

    for (let i = 0; i < inGeoms.length; i++)
    {
        const geom = inGeoms[i].get();
        if (geom && geom._vertices)
        {
            if (i === 0)
            {
                mesh = new CGL.Mesh(cgl, geom);

                mesh.addAttribute(prfx + "attrMorphTargetA", geom._vertices, 3);
                mesh.addAttribute(prfx + "attrMorphTargetB", geom._vertices, 3);
                updateGeom();
            }
        }
    }
}

function updateGeom()
{
    let geom1;
    let geom2;

    if (method_autoAnim || method_manualFade)
    {
        let getGeom = nextGeom.get();
        if (getGeom < 0) getGeom = 0;
        else if (getGeom >= NUMGEOMS) getGeom = NUMGEOMS;
        let temp = 0;

        if (oldGeom === getGeom) return;

        anim.clear();
        anim.setValue(op.patch.freeTimer.get(), 0);
        anim.setValue(op.patch.freeTimer.get() + duration.get(), 1, function ()
        {
            oldGeom = getGeom;
            finished.set(true);
        });
        finished.set(false);

        geom1 = inGeoms[oldGeom].get();
        geom2 = inGeoms[getGeom].get();

        if (method_manualFade)
        {
            if (inFade.get() != 0) geom2 = inGeoms[oldGeom].get();
            if (inFade.get() == 1) geom1 = inGeoms[getGeom].get();

            oldGeom = getGeom;
        }
    }

    if (method_interpolate2)
    {
        const b = Math.max(Math.floor(inIndex.get()), 0);
        const a = Math.min(Math.ceil(inIndex2.get()), NUMGEOMS);

        if (inGeoms[a]) geom1 = inGeoms[a].get();
        else geom1 = null;

        if (inGeoms[b]) geom2 = inGeoms[b].get();
        else geom2 = null;
    }

    if (method_interpolate)
    {
        const a = Math.max(Math.floor(inIndex.get()), 0);
        const b = Math.min(Math.ceil(inIndex.get()), NUMGEOMS);

        if (inGeoms[a]) geom1 = inGeoms[a].get();
        else geom1 = null;

        if (inGeoms[b]) geom2 = inGeoms[b].get();
        else geom2 = null;
    }

    if (mesh && geom1 && geom2 && geom1._vertices && geom2._vertices)
    {
        mesh.updateAttribute(prfx + "attrMorphTargetB", geom1._vertices);
        mesh.updateAttribute(prfx + "attrMorphTargetA", geom2._vertices);
    }
}

function doRender()
{
    if (method_autoAnim) mod.setUniformValue("MOD_fade", anim.getValue(op.patch.freeTimer.get()));
    else if (method_interpolate)
    {
        let f = inIndex.get() % 1;
        mod.setUniformValue("MOD_fade", f);
    }
    else if (method_manualFade) mod.setUniformValue("MOD_fade", inFade.get());
    else if (method_interpolate2) mod.setUniformValue("MOD_fade", inFade.get());

    if (mesh)
    {
        mod.bind();
        mesh.render(cgl.getShader());
        next.trigger();
        mod.unbind();
    }
}
