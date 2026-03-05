const
    render = op.inTrigger("render"),
    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Tri Prism", "Hex Prism", "Axis X", "Axis Y", "Axis Z", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),

    inViz = op.inBool("Visualize Area", false),

    inWorldSpace = op.inValueBool("WorldSpace", false),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),

    //    inFalloff = op.inFloat("Falloff", 0),
    // inFalloffCurve = op.inSwitch("Falloff Curve", ["Linear", "Smoothstep", "pow2", "pow3"], "Linear"),

    inRadius = op.inValue("Radius", 1),
    sizeX = op.inFloat("Area Size X", 1),
    sizeY = op.inFloat("Area Size Y", 1),
    sizeZ = op.inFloat("Area Size Z", 1),

    changeTranslateX = op.inFloat("Translate X", 0),
    changeTranslateY = op.inFloat("Translate Y", 0),
    changeTranslateZ = op.inFloat("Translate Z", 0),

    changeScaleX = op.inFloat("Scale X", 0.5),
    changeScaleY = op.inFloat("Scale Y", 0.5),
    changeScaleZ = op.inFloat("Scale Z", 0.5),

    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;

op.setPortGroup("Area", [inRadius, sizeX, sizeY, sizeZ]);

inViz.onChange =
    inWorldSpace.onChange =
    // inFalloffCurve.onChange =
    inArea.onChange = updateDefines;

const srcHeadVert = attachments.deformarea_vert;

const srcBodyVert = ""
    .endl() + "pos=MOD_deform(pos,mMatrix,false,norm);"
    // .endl() + "norm=MOD_deform(pos,mMatrix,true,norm).xyz;"
    .endl();

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.deformarea_vert,
    "srcBodyVert": srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": "IN float MOD_viz;".endl(),
    // "srcBodyFrag": "col=mix(col,vec4(1.,0.,0.,1.),MOD_viz);"
    "srcBodyFrag": "#ifdef MOD_VIZ\nif(MOD_viz>0.0001)col=vec4(1.,0.,0.,1.);\n#endif\n"
});

mod.addUniformVert("f", "MOD_fallOff", 0);
mod.addUniformVert("f", "MOD_radius", inRadius);

mod.addUniformVert("3f", "MOD_pos", x, y, z);
mod.addUniformVert("3f", "MOD_scale", sizeX, sizeY, sizeZ);
mod.addUniformVert("3f", "MOD_changeScale", changeScaleX, changeScaleY, changeScaleZ);
mod.addUniformVert("3f", "MOD_changeTranslate", changeTranslateX, changeTranslateY, changeTranslateZ);

updateDefines();

function updateDefines()
{
    // mod.toggleDefine("MOD_FALLOFF_SMOOTH", inFalloffCurve.get() == "Smoothstep");
    // mod.toggleDefine("MOD_FALLOFF_POW2", inFalloffCurve.get() == "pow2");
    // mod.toggleDefine("MOD_FALLOFF_POW3", inFalloffCurve.get() == "pow3");

    mod.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    mod.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    mod.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    mod.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    mod.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    mod.toggleDefine("MOD_AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
    mod.toggleDefine("MOD_AREA_TRIPRISM", inArea.get() == "Tri Prism");
    mod.toggleDefine("MOD_AREA_HEXPRISM", inArea.get() == "Hex Prism");

    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_VIZ", inViz.get());

    inRadius.setUiAttribs({ "greyout": inArea.get() != "Sphere" });
    sizeZ.setUiAttribs({ "greyout": inArea.get() != "Box" });
    sizeY.setUiAttribs({ "greyout": inArea.get() != "Box" });
    sizeX.setUiAttribs({ "greyout": inArea.get() != "Box" });
}

render.onTriggered = function ()
{
    if (CABLES.UI)
    {
        if (op.isCurrentUiOp()) gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

        if (cgl.shouldDrawHelpers(op))
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

            if (inArea.get() == "Sphere")
                CABLES.GL_MARKER.drawSphere(op, inRadius.get());
            cgl.popModelMatrix();
        }
    }

    mod.bind();
    next.trigger();
    mod.unbind();
};

///
