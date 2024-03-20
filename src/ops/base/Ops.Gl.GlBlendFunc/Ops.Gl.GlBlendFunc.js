const vals = ["ZERO",
    "ONE",
    "SRC_COLOR",
    "ONE_MINUS_SRC_COLOR",
    "SRC_ALPHA",
    "ONE_MINUS_SRC_ALPHA",
    "DST_ALPHA",
    "ONE_MINUS_DST_ALPHA",
    "DST_COLOR",
    "ONE_MINUS_DST_COLOR",
    "SRC_ALPHA_SATURATE",

    "CONSTANT_COLOR",
    "ONE_MINUS_CONSTANT_COLOR",
    "CONSTANT_ALPHA",
    "ONE_MINUS_CONSTANT_ALPHA",
];

const
    inExec = op.inTrigger("Exec"),
    inSrc = op.inDropDown("Src RGB", vals, "SRC_COLOR"),
    inDst = op.inDropDown("Dst RGB", vals, "ONE_MINUS_SRC_COLOR"),
    inSrcAlpha = op.inDropDown("Src Alpha", vals, "SRC_ALPHA"),
    inDstAlpha = op.inDropDown("Dst Alpha", vals, "DST_ALPHA"),
    inBlendEquation = op.inDropDown("Blend Equation", ["Add", "Sub", "Reverse Sub", "Min", "Max"]),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
const gl = cgl.gl;

inExec.onTriggered = () =>
{
    cgl.gl[inSrc.get()];

    cgl.pushBlend(true);
    cgl.pushBlendMode(CGL.BLEND_NORMAL, false);

    if (inBlendEquation.get() == "Add")gl.blendEquation(gl.FUNC_ADD);
    if (inBlendEquation.get() == "Sub")gl.blendEquation(gl.FUNC_SUBTRACT);
    if (inBlendEquation.get() == "Reverse Sub")gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);
    if (inBlendEquation.get() == "Min")gl.blendEquation(gl.MIN);
    if (inBlendEquation.get() == "Max")gl.blendEquation(gl.MAX);

    gl.blendFuncSeparate(gl[inSrc.get()], gl[inDst.get()], gl[inSrcAlpha.get()], gl[inDstAlpha.get()]);

    next.trigger();

    cgl.popBlendMode();
    cgl.popBlend();
};
