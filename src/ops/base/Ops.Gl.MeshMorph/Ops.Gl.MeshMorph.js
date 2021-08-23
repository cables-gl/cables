const cgl = op.patch.cgl;

const render = op.inTrigger("render");

const nextGeom = op.inValueInt("Geometry");
const duration = op.inValue("Duration", 1.0);

const finished = op.outValue("Finished");

let mesh = null;
const inGeoms = [];
nextGeom.onChange = updateGeom;

let oldGeom = 0;
const anim = new CABLES.Anim();
anim.clear();

const trigger = op.outTrigger("trigger");

const calcVertexNormals = op.inBool("smooth");
calcVertexNormals.set(true);

const geoms = [];
// var mesh=null;
window.meshsequencecounter = window.meshsequencecounter || 1;
window.meshsequencecounter++;
const prfx = String.fromCharCode(97 + window.meshsequencecounter);
const needsUpdateFrame = false;
render.onTriggered = doRender;

const srcHeadVert = ""
    .endl() + "IN vec3 " + prfx + "attrMorphTargetA;"
    .endl() + "IN vec3 " + prfx + "attrMorphTargetB;"
    .endl() + "UNI float {{mod}}fade;"
    .endl() + "UNI float {{mod}}doMorph;"
    .endl();

const srcBodyVert = ""
    // .endl()+'   pos =vec4(vPosition,1.0);'
    .endl() + "if({{mod}}doMorph==1.0){"
    .endl() + "  pos = vec4( " + prfx + "attrMorphTargetA * {{mod}}fade + " + prfx + "attrMorphTargetB * (1.0 - {{mod}}fade ), 1. );"
    .endl() + "}"
    .endl();

let uniFade = null;
let module = null;
let shader = null;
let uniDoMorph = null;

for (let i = 0; i < 8; i++)
{
    const inGeom = op.inObject("Geometry " + (i));
    inGeom.onChange = updateMeshes;
    inGeoms.push(inGeom);
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
                // op.log("MESH BUILD");
                updateGeom();
            }
        }
    }
}

function updateGeom()
{
    let getGeom = nextGeom.get();
    if (getGeom < 0) getGeom = 0;
    else if (getGeom >= 7) getGeom = 7;
    let temp = 0;//= 0

    if (oldGeom === getGeom) return;

    anim.clear();
    anim.setValue(op.patch.freeTimer.get(), 0);
    anim.setValue(op.patch.freeTimer.get() + duration.get(), 1,
        function ()
        {
            // op.log("finished");
            oldGeom = getGeom;
            finished.set(true);
        });
    finished.set(false);

    const geom1 = inGeoms[oldGeom].get();

    temp = getGeom;

    const geom2 = inGeoms[temp].get();

    if (mesh && geom1 && geom2 && geom1._vertices && geom2._vertices)
    {
        mesh.updateAttribute(prfx + "attrMorphTargetB", geom1._vertices);
        mesh.updateAttribute(prfx + "attrMorphTargetA", geom2._vertices);
    }
}

function removeModule()
{
    if (shader && module)
    {
        shader.removeModule(module);
        shader = null;
    }
}

function doRender()
{
    if (cgl.getShader() && cgl.getShader() != shader)
    {
        if (shader) removeModule();

        shader = cgl.getShader();
        module = shader.addModule(
            {
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": srcBodyVert
            });

        uniFade = new CGL.Uniform(shader, "f", module.prefix + "fade", 0);
        uniDoMorph = new CGL.Uniform(shader, "f", module.prefix + "doMorph", 1);
    }

    if (uniDoMorph)
    {
        uniFade.setValue(anim.getValue(op.patch.freeTimer.get()));

        uniDoMorph.setValue(1.0);
        if (mesh !== null) mesh.render(cgl.getShader());
        uniDoMorph.setValue(0);
        trigger.trigger();
    }
}
