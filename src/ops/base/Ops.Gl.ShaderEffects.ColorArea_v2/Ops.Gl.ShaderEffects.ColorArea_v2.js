const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Axis X", "Axis Y", "Axis Z", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),
    inSize = op.inValue("Size", 1),
    inAmount = op.inValueSlider("Amount", 0.5),
    inFalloff = op.inValueSlider("Falloff", 0),
    inInvert = op.inValueBool("Invert"),
    inBlend = op.inSwitch("Blend ", ["Normal", "Multiply"], "Normal"),
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
let moduleFrag = null;
let moduleVert = null;
const uniforms = {};
let shader = null;
let origShader = null;

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

render.onLinkChanged = removeModule;

inWorldSpace.onChange =
    inArea.onChange =
    inInvert.onChange =
    inBlend.onChange = updateDefines;

render.onTriggered = doRender;

function updateDefines()
{
    if (!shader) return;
    shader.toggleDefine(moduleVert.prefix + "BLEND_NORMAL", inBlend.get() == "Normal");
    shader.toggleDefine(moduleVert.prefix + "BLEND_MULTIPLY", inBlend.get() != "Normal");

    shader.toggleDefine(moduleVert.prefix + "AREA_INVERT", inInvert.get());
    shader.toggleDefine(moduleVert.prefix + "WORLDSPACE", inWorldSpace.get());

    shader.toggleDefine(moduleVert.prefix + "AREA_AXIS_X", inArea.get() == "Axis X");
    shader.toggleDefine(moduleVert.prefix + "AREA_AXIS_Y", inArea.get() == "Axis Y");
    shader.toggleDefine(moduleVert.prefix + "AREA_AXIS_Z", inArea.get() == "Axis Z");
    shader.toggleDefine(moduleVert.prefix + "AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    shader.toggleDefine(moduleVert.prefix + "AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    shader.toggleDefine(moduleVert.prefix + "AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
    shader.toggleDefine(moduleVert.prefix + "AREA_SPHERE", inArea.get() == "Sphere");
    shader.toggleDefine(moduleVert.prefix + "AREA_BOX", inArea.get() == "Box");
}

function removeModule()
{
    if (shader && moduleFrag) shader.removeModule(moduleFrag);
    if (shader && moduleVert) shader.removeModule(moduleVert);

    if (shader) shader.dispose();
    origShader = null;
    shader = null;
}

function doRender()
{
    if (CABLES.UI)
    {
        cgl.pushModelMatrix();
        // mat4.identity(cgl.mMatrix);

        if (op.isCurrentUiOp()) gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

        if (cgl.shouldDrawHelpers(op))
        {
            mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);
            CABLES.GL_MARKER.drawSphere(op, inSize.get());
        }
        cgl.popModelMatrix();
    }

    if (!cgl.getShader())
    {
        next.trigger();
        return;
    }

    if (cgl.getShader() != origShader)
    {
        if (shader) removeModule();
        origShader = cgl.getShader();
        shader = origShader;// .copy();

        moduleVert = shader.addModule(
            {
                "priority": 2,
                "title": op.objName,
                "name": "MODULE_VERTEX_POSITION",
                srcHeadVert,
                srcBodyVert
            });

        moduleFrag = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_COLOR",
                "srcHeadFrag": attachments.colorarea_head_frag,
                "srcBodyFrag": attachments.colorarea_frag
            }, moduleVert);

        uniforms.inSizeAmountFalloffSizeX = new CGL.Uniform(shader, "4f", moduleFrag.prefix + "inSizeAmountFalloffSizeX", inSize, inAmount, inFalloff, sizeX);
        uniforms.color = new CGL.Uniform(shader, "3f", moduleFrag.prefix + "color", r, g, b);
        uniforms.pos = new CGL.Uniform(shader, "3f", moduleFrag.prefix + "pos", x, y, z);

        updateDefines();
    }

    if (!shader) return;

    // shader.copyUniforms(origShader);

    cgl.pushShader(shader);
    next.trigger();
    cgl.popShader();
}
