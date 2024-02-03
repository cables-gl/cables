const
    render = op.inTrigger("render"),
    inInvert = op.inValueBool("Invert"),
    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Axis X", "Axis Y", "Axis Z", "Axis XY", "Axis XZ", "Axis YZ", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),
    inSize = op.inValue("Size", 1),
    inSizeX = op.inValueFloat("Size X", 1),
    inSizeY = op.inValueFloat("Size Y", 1),
    inSizeZ = op.inValueFloat("Size Z", 1),
    inRepeat = op.inValueBool("Repeat"),
    inRepeatDist = op.inValueFloat("Repeat Distance", 0.0),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    inWorldSpace = op.inValueBool("WorldSpace", true),
    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;

op.setPortGroup("Size", [inSize, inSizeY, inSizeX, inSizeZ]);
op.setPortGroup("Position", [x, y, z, inWorldSpace]);


const srcHeadVert = ""
    .endl() + "OUT vec4 MOD_areaPos;"
    .endl();

const srcBodyVert = ""
    .endl() + "#ifndef MOD_WORLDSPACE"
    .endl() + "   MOD_areaPos=pos;"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_WORLDSPACE"
    .endl() + "   MOD_areaPos=mMatrix*pos;"
    .endl() + "#endif"
    .endl();

inWorldSpace.onChange =
inInvert.onChange =
inRepeat.onChange =
inArea.onChange = updateDefines;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "priority": 2,
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});
mod.addModule({
    "title": op.objName,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.areadiscard_head_frag || "",
    "srcBodyFrag": attachments.areadiscard_frag || ""
});

mod.addUniformFrag("f", "MOD_size", inSize);
mod.addUniformFrag("f", "MOD_x", x);
mod.addUniformFrag("f", "MOD_y", y);
mod.addUniformFrag("f", "MOD_z", z);
mod.addUniformFrag("3f", "MOD_sizeAxis", inSizeX, inSizeY, inSizeZ);
mod.addUniformFrag("f", "MOD_repeat", inRepeatDist);

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_AREA_INVERT", inInvert.get());
    mod.toggleDefine("MOD_AREA_REPEAT", inRepeat.get());
    mod.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    mod.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    mod.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    mod.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    mod.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    mod.toggleDefine("MOD_AREA_AXIS_XY", inArea.get() == "Axis XY");
    mod.toggleDefine("MOD_AREA_AXIS_XZ", inArea.get() == "Axis XZ");
    mod.toggleDefine("MOD_AREA_AXIS_YZ", inArea.get() == "Axis YZ");
    mod.toggleDefine("MOD_AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
}

render.onTriggered = function ()
{
    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": x,
                "posY": y,
                "posZ": z
            });

    if (cgl.shouldDrawHelpers(op)) CABLES.GL_MARKER.drawSphere(op, inSize.get());

    mod.bind();
    next.trigger();
    mod.unbind();
};
