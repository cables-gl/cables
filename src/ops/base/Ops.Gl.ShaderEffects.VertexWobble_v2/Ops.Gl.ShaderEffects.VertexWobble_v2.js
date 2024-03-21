let self = this;
const cgl = op.patch.cgl;

const render = op.inTrigger("render");
let src = op.inValueSelect("Source", [
    "X * Z + Time",
    "X * Y + Time",
    "length",
    "X + Time",
    "Y + Time",
    "Z + Time"], "X * Z + Time");

const
    amount = op.inValueSlider("amount", 0.1),
    inTime = op.inFloat("Time", 0),
    mul = op.inValueFloat("Scale", 3),
    toAxisX = op.inValueBool("axisX", true),
    toAxisY = op.inValueBool("axisY", true),
    toAxisZ = op.inValueBool("axisZ", true),
    positive = op.inSwitch("Range", ["-1 to 1", "0 to 1"], "-1 to 1"),

    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Axis X", "Axis Y", "Axis Z", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),
    inSize = op.inValue("Size", 1),
    inFalloff = op.inValueSlider("Falloff", 0),

    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    inWorldSpace = op.inValueBool("WorldSpace", true),
    inInvert = op.inValueBool("Invert"),

    next = this.outTrigger("trigger");

op.setPortGroup("Area", [inArea, inSize, x, y, z, inFalloff, inWorldSpace, inInvert]);

positive.onChange =
inArea.onChange =
    inWorldSpace.onChange =
    inSize.onChange =
    src.onChange =
    toAxisZ.onChange =
    toAxisX.onChange =
    toAxisY.onChange = setDefines;

const srcHeadVert = "";
// let startTime = CABLES.now() / 1000.0;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": attachments.sinewobble_vert
});

mod.addUniform("4f", "MOD_posSize", x, y, z, inSize);
mod.addUniformVert("f", "MOD_time", inTime);
mod.addUniformVert("f", "MOD_amount", amount);
mod.addUniformVert("f", "MOD_scale", mul);
mod.addUniformVert("f", "MOD_falloff", inFalloff);

setDefines();

function setDefines()
{
    mod.toggleDefine("MOD_AREA_INVERT", inInvert.get());
    mod.toggleDefine("MOD_POSITIVE", positive.get() == "0 to 1");

    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    mod.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    mod.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    mod.toggleDefine("MOD_AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
    mod.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    mod.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");

    mod.toggleDefine("MOD_TO_AXIS_X", toAxisX.get());
    mod.toggleDefine("MOD_TO_AXIS_Y", toAxisY.get());
    mod.toggleDefine("MOD_TO_AXIS_Z", toAxisZ.get());
    mod.toggleDefine("MOD_SRC_XZ", !src.get() || src.get() == "X * Z + Time" || src.get() === "");
    mod.toggleDefine("MOD_SRC_XY", src.get() == "X * Y + Time");
    mod.toggleDefine("MOD_SRC_X", src.get() == "X + Time");
    mod.toggleDefine("MOD_SRC_Y", src.get() == "Y + Time");
    mod.toggleDefine("MOD_SRC_Z", src.get() == "Z + Time");
    mod.toggleDefine("MOD_SRC_LENGTH", src.get() == "length");
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};
