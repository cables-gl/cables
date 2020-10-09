const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Axis X", "Axis Y", "Axis Z", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),
    inSize = op.inValue("Size", 1),
    inAmount = op.inValueSlider("Amount", 0.5),
    inFalloff = op.inValueSlider("Falloff", 0),
    inInvert = op.inValueBool("Invert"),
    inBlend = op.inSwitch("Blend ", ["Normal", "Multiply", "Opacity"], "Normal"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    sizeX = op.inValueSlider("Size X", 1),
    inWorldSpace = op.inValueBool("WorldSpace", true),
    next = op.outTrigger("Next");

op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Color", [inBlend, r, g, b]);
r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;

const srcHeadVert = ""
    .endl() + "OUT vec4 MOD_vertPos;"
    .endl();

const srcBodyVert = ""
    .endl() + "#ifndef MOD_WORLDSPACE"
    .endl() + "   MOD_vertPos=vec4(vPosition,1.0);"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_WORLDSPACE"
    .endl() + "   MOD_vertPos=mMatrix*pos;"
    .endl() + "#endif"
    .endl();

inWorldSpace.onChange =
    inArea.onChange =
    inInvert.onChange =
    inBlend.onChange = updateDefines;

render.onTriggered = doRender;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "priority": 2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    srcHeadVert,
    srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.colorarea_head_frag,
    "srcBodyFrag": attachments.colorarea_frag
});

mod.addUniform("4f", "MOD_inSizeAmountFalloffSizeX", inSize, inAmount, inFalloff, sizeX);
mod.addUniform("3f", "MOD_color", r, g, b);
mod.addUniform("3f", "MOD_pos", x, y, z);
updateDefines();


function updateDefines()
{
    mod.toggleDefine("MOD_BLEND_NORMAL", inBlend.get() == "Normal");
    mod.toggleDefine("MOD_BLEND_OPACITY", inBlend.get() == "Opacity");
    mod.toggleDefine("MOD_BLEND_MULTIPLY", inBlend.get() == "Multiply");


    mod.toggleDefine("MOD_AREA_INVERT", inInvert.get());
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());

    mod.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    mod.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    mod.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    mod.toggleDefine("MOD_AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
    mod.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    mod.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
}

function drawHelpers()
{
    if (cgl.frameStore.shadowPass) return;
    if (cgl.shouldDrawHelpers(op)) gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });
}


function doRender()
{
    mod.bind();
    drawHelpers();
    next.trigger();

    mod.unbind();
}
