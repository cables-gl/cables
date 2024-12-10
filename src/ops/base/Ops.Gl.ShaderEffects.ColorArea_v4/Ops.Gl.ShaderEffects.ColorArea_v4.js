const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Axis X", "Axis Y", "Axis Z", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),
    inSize = op.inValue("Size", 1),
    inAmount = op.inValueSlider("Amount", 0.5),
    inFalloff = op.inValueSlider("Falloff", 0),
    inInvert = op.inValueBool("Invert"),
    inBlend = op.inSwitch("Blend ", ["Normal", "Multiply", "Opacity", "Add", "Discard"], "Normal"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    doScale = op.inBool("Change Size", false),
    sizeX = op.inFloat("Size X", 1),
    sizeY = op.inFloat("Size Y", 1),
    sizeZ = op.inFloat("Size Z", 1),
    inTex = op.inTexture("Texture"),

    inWorldSpace = op.inValueBool("WorldSpace", true),
    inPrio = op.inBool("Priority", true),
    next = op.outTrigger("Next");

op.setPortGroup("Scale", [doScale, sizeX, sizeZ, sizeY]);
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
    inTex.onLinkChanged =
    inArea.onChange =
    inInvert.onChange =
    doScale.onChange =
    inBlend.onChange = updateDefines;

render.onTriggered = doRender;

const vertModTitle = "vert_" + op.name;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 2,
    "title": vertModTitle,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.colorarea_head_frag,
    "srcBodyFrag": attachments.colorarea_frag
});

mod.addUniform("4f", "MOD_inSizeAmountFalloffSizeX", inSize, inAmount, inFalloff, 0);
mod.addUniform("3f", "MOD_color", r, g, b);
mod.addUniform("3f", "MOD_pos", x, y, z);
mod.addUniform("3f", "MOD_scale", sizeX, sizeY, sizeZ);
mod.addUniform("t", "MOD_tex");

updateDefines();

inPrio.onChange = updatePrio;
updatePrio();

function updatePrio()
{
    mod.removeModule(vertModTitle);

    const vmod = {
        // "priority": 0,
        "title": vertModTitle,
        "name": "MODULE_VERTEX_POSITION",
        srcHeadVert,
        srcBodyVert
    };

    if (inPrio.get()) vmod.priority = 2;

    mod.addModule(vmod);
}

function updateDefines()
{
    mod.toggleDefine("MOD_BLEND_NORMAL", inBlend.get() == "Normal");
    mod.toggleDefine("MOD_BLEND_OPACITY", inBlend.get() == "Opacity");
    mod.toggleDefine("MOD_BLEND_MULTIPLY", inBlend.get() == "Multiply");
    mod.toggleDefine("MOD_BLEND_DISCARD", inBlend.get() == "Discard");
    mod.toggleDefine("MOD_BLEND_ADD", inBlend.get() == "Add");

    mod.toggleDefine("MOD_AREA_SIZE", doScale.get());

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

    mod.toggleDefine("MOD_DOSCALE", doScale.get());

    // mod.removeUniform("3f", "MOD_scale",sizeX,sizeY,sizeZ);
    sizeX.setUiAttribs({ "greyout": !doScale.get() });
    sizeY.setUiAttribs({ "greyout": !doScale.get() });
    sizeZ.setUiAttribs({ "greyout": !doScale.get() });

    mod.toggleDefine("MOD_USE_TEX", inTex.isLinked());
}

function drawHelpers()
{
    if (cgl.tempData.shadowPass) return;
    if (cgl.shouldDrawHelpers(op)) gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });
}

function doRender()
{
    // if(doScale.get()) mod.setUniformValue("MOD_scale",[sizeX.get(),sizeY.get(),sizeZ.get()]);
    mod.bind();

    if (inTex.isLinked())
    {
        let tex = inTex.get();

        if (!tex) tex = CGL.Texture.getEmptyTexture(cgl).tex;
        else tex = tex.tex;

        mod.pushTexture("MOD_tex", tex);
    }

    drawHelpers();
    next.trigger();

    mod.unbind();
}
