let self = this;
const cgl = op.patch.cgl;

const render = op.inTrigger("render");
const next = this.outTrigger("trigger");
const frequency = op.inValueFloat("frequency", 1);
const amount = op.inValueSlider("amount", 1.0);
const phase = op.inValueFloat("phase", 1);
const mul = op.inValueFloat("mul", 3);
const add = op.inValueFloat("add", 0);
const toAxisX = op.inValueBool("axisX", true);
const toAxisY = op.inValueBool("axisY", true);
const toAxisZ = op.inValueBool("axisZ", true);
let src = op.inValueSelect("Source", [
    "X * Z + Time",
    "X * Y + Time",
    "X + Time",
    "Y + Time",
    "Z + Time"], "X * Z + Time");

let uniMul = null;
let uniFrequency = null;
let uniAmount = null;
let uniPhase = null;
let uniAdd = null;

src.onChange =
    toAxisZ.onChange =
    toAxisX.onChange =
    toAxisY.onChange = setDefines;

const srcHeadVert = "";

let startTime = CABLES.now() / 1000.0;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": attachments.sinewobble_vert
});

mod.addUniformVert("f", "MOD_time", 0);
mod.addUniformVert("f", "MOD_frequency", frequency);
mod.addUniformVert("f", "MOD_amount", amount);
mod.addUniformVert("f", "MOD_phase", phase);
mod.addUniformVert("f", "MOD_mul", mul);
mod.addUniformVert("f", "MOD_add", add);
setDefines();

function setDefines()
{
    mod.toggleDefine("MOD_TO_AXIS_X", toAxisX.get());
    mod.toggleDefine("MOD_TO_AXIS_Y", toAxisY.get());
    mod.toggleDefine("MOD_TO_AXIS_Z", toAxisZ.get());
    mod.toggleDefine("MOD_SRC_XZ", !src.get() || src.get() == "X * Z + Time" || src.get() === "");
    mod.toggleDefine("MOD_SRC_XY", src.get() == "X * Y + Time");
    mod.toggleDefine("MOD_SRC_X", src.get() == "X + Time");
    mod.toggleDefine("MOD_SRC_Y", src.get() == "Y + Time");
    mod.toggleDefine("MOD_SRC_Z", src.get() == "Z + Time");
}

render.onTriggered = function ()
{
    mod.bind();
    mod.setUniformValue("MOD_time", CABLES.now() / 1000.0 - startTime);
    next.trigger();
    mod.unbind();
};
