const
    inTrigger = op.inTrigger("Render"),
    inAttr = op.inSwitch("Attribute", ["Position", "TexCoords", "Normals", "Normal Mat", "Tangents", "BiTangents"], "Normals"),
    next = op.outTrigger("Next");


let shader = null;

inAttr.onChange = updateDefines;

function updateDefines()
{
    if (!shader) return;
    shader.toggleDefine("SHOW_POS", inAttr.get() == "Position");
    shader.toggleDefine("SHOW_TEXCOORDS", inAttr.get() == "TexCoords");
    shader.toggleDefine("SHOW_NORMALS", inAttr.get() == "Normals");
    shader.toggleDefine("SHOW_NORMAL_MAT", inAttr.get() == "Normal Mat");
    // shader.toggleDefine("SHOW_TANGENTS", inAttr.get() == "Tangents");
    // shader.toggleDefine("SHOW_BITANGENTS", inAttr.get() == "BiTangents");
    // shader.toggleDefine("SHOW_TEXCOORDS1", inAttr.get() == "TexCoords 1");

    // shader.toggleDefine("ABS", inAbs.get());
    // shader.toggleDefine("MULMODEL", inMulModel.get());
}

inTrigger.onTriggered = () =>
{
    const cgp = op.patch.cg;
    if (!shader)
    {
        shader = new CGP.Shader(cgp, op.name);
        shader.setSource(attachments.mat_wgsl);
        // shader.addUniformFrag("4f", "color", r, g, b, a);
        updateDefines();
    }

    cgp.pushShader(shader);

    next.trigger();

    cgp.popShader();
};
