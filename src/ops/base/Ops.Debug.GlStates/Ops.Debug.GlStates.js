const cgl = op.patch.cgl;

const
    exec = op.inTrigger("Update"),
    next = op.outTrigger("Next"),

    outError = op.outBoolNum("glGetError"),

    depth = op.outBoolNum("Depthtest"),
    depthStack = op.outBoolNum("Stack Depthtest"),

    depthWrite = op.outBoolNum("Depth Writing"),
    depthWriteStack = op.outBoolNum("Stack Depth Writing"),

    depthFunc = op.outBoolNum("DepthFunc"),
    depthFuncStack = op.outBoolNum("Stack DepthFunc"),

    blend = op.outBoolNum("Blend"),
    blendStack = op.outBoolNum("Blend Stack"),

    cull = op.outBoolNum("Cull Mode"),
    culling = op.outBoolNum("Face Culling"),
    isShadowPass = op.outBool("Is Shadowpass");

exec.onTriggered = function ()
{
    depth.set(cgl.gl.isEnabled(cgl.gl.DEPTH_TEST));
    depthStack.set(cgl.stateDepthTest());

    depthWrite.set(cgl.gl.getParameter(cgl.gl.DEPTH_WRITEMASK));
    depthWriteStack.set(cgl.stateDepthWrite());

    depthFunc.set(depthFuncToString(cgl.gl.getParameter(cgl.gl.DEPTH_FUNC)));
    depthFuncStack.set(depthFuncToString(cgl.stateDepthFunc()));

    blend.set(cgl.gl.isEnabled(cgl.gl.BLEND));
    blendStack.set(cgl.stateBlend());

    culling.set(cgl.gl.isEnabled(cgl.gl.CULL_FACE));

    cull.set(cullModeToString(cgl.gl.getParameter(cgl.gl.CULL_FACE_MODE)));

    outError.set(errorToString(cgl.gl.getError()));
    isShadowPass.set(cgl.tempData.shadowPass);

    op.log(cgl._textureslots);
    next.trigger();
};

function errorToString(e)
{
    if (e == cgl.gl.NO_ERROR) return "NO_ERROR";
    if (e == cgl.gl.OUT_OF_MEMORY) return "OUT_OF_MEMORY";
    if (e == cgl.gl.INVALID_ENUM) return "INVALID_ENUM";
    if (e == cgl.gl.INVALID_OPERATION) return "INVALID_OPERATION";
    if (e == cgl.gl.INVALID_FRAMEBUFFER_OPERATION) return "INVALID_FRAMEBUFFER_OPERATION";
    if (e == cgl.gl.INVALID_VALUE) return "INVALID_VALUE";
    if (e == cgl.gl.CONTEXT_LOST_WEBGL) return "CONTEXT_LOST_WEBGL";
}

function cullModeToString(c)
{
    if (c == cgl.gl.FRONT) return "FRONT";
    if (c == cgl.gl.BACK) return "BACK";
    if (c == cgl.gl.FRONT_AND_BACK) return "FRONT_AND_BACK";
}

function depthFuncToString(f)
{
    if (f == cgl.gl.NEVER) return "NEVER";
    if (f == cgl.gl.LESS) return "LESS";
    if (f == cgl.gl.EQUAL) return "EQUAL";
    if (f == cgl.gl.LEQUAL) return "LEQUAL";
    if (f == cgl.gl.GREATER) return "GREATER";
    if (f == cgl.gl.NOTEQUAL) return "NOTEQUAL";
    if (f == cgl.gl.GEQUAL) return "GEQUAL";
    if (f == cgl.gl.ALWAYS) return "ALWAYS";
}
