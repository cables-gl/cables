let render = op.inTrigger("Render");

let inSmooth = op.inValueBool("Smooth", true);
let next = op.outTrigger("Next");

let cgl = op.patch.cgl;
let shaderModule = null;
let shader = null;

let id = CABLES.generateUUID();

let lastTime = 0;
let mark = new CGL.Marker(cgl);
let needsRebuild = false;

let numForces = 0;
let forceUniforms = [];
let firstTime = true;

let uniTime = null;
let uniSize = null;
let uniTimeDiff = null;
let uniPos = null;
let uniLifetime = null;
let uniFadeInOut = null;
let uniSmooth = null;
let uniModelMatrix = null;

let mmat = mat4.create();

render.onTriggered = function ()
{
    if (needsRebuild)doReset();
    let time = op.patch.freeTimer.get();
    let timeDiff = time - lastTime;

    if (cgl.getShader() != shader)
    {
        if (shader) removeModule();
        shader = cgl.getShader();
        shader.glslVersion = 300;
        shaderModule = shader.addModule(
            {
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": attachments.deformer_head_vert,
                "srcBodyVert": attachments.deformer_vert,
                "priority": 10
            });

        uniTime = new CGL.Uniform(shader, "f", shaderModule.prefix + "time", 0);

        uniSmooth = new CGL.Uniform(shader, "f", shaderModule.prefix + "smooth", inSmooth);
        uniModelMatrix = new CGL.Uniform(shader, "m4", shaderModule.prefix + "modelMatrix", cgl.modelMatrix());
    }

    if (!shader) return;

    for (let i = 0; i < CABLES.forceFieldForces.length; i++)
    {
        let force = CABLES.forceFieldForces[i];
        if (force)
            if (!force.hasOwnProperty(id + "uniRange"))
            {
                force[id + "uniRange"] = new CGL.Uniform(shader, "f", "forces[" + i + "].range", force.range);
                force[id + "uniAttraction"] = new CGL.Uniform(shader, "f", "forces[" + i + "].attraction", force.attraction);
                force[id + "uniAngle"] = new CGL.Uniform(shader, "f", "forces[" + i + "].angle", force.angle);
                force[id + "uniPos"] = new CGL.Uniform(shader, "3f", "forces[" + i + "].pos", force.pos);
                force[id + "uniTime"] = new CGL.Uniform(shader, "f", "forces[" + i + "].time", time);
            }
            else
            {
                force[id + "uniRange"].setValue(force.range);
                force[id + "uniAttraction"].setValue(force.attraction);
                force[id + "uniAngle"].setValue(force.angle);
                force[id + "uniPos"].setValue(force.pos);
                force[id + "uniTime"].setValue(time);
                force[id + "uniTime"].setValue(time);
            }
    }

    mat4.copy(mmat, cgl.modelMatrix());
    uniModelMatrix.setValue(mmat);
    // op.log(cgl.modelMatrix());

    lastTime = op.patch.freeTimer.get();

    next.trigger();
};

function removeModule()
{
    if (shader && shaderModule)
    {
        shader.removeModule(shaderModule);
        shader = null;
    }
}

render.onLinkChanged = removeModule;
