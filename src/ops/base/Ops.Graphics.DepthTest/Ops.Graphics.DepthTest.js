const
    render = op.inTrigger("Render"),
    enable = op.inValueBool("Enable depth testing", true),
    meth = op.inValueSelect("Depth Test Method", ["never", "always", "less", "less or equal", "greater", "greater or equal", "equal", "not equal"], "less or equal"),
    write = op.inValueBool("Write to depth buffer", true),
    trigger = op.outTrigger("Next");

const cgl = op.patch.cgl;
let compareMethod = CABLES.CG.DEPTH_COMPARE_LESSEQUAL;

meth.onChange = updateFunc;

function updateFunc()
{
    const m = meth.get();
    if (m == "never") compareMethod = CABLES.CG.DEPTH_COMPARE_NEVER;
    else if (m == "always") compareMethod = CABLES.CG.DEPTH_COMPARE_ALWAYS;
    else if (m == "less") compareMethod = CABLES.CG.DEPTH_COMPARE_LESS;
    else if (m == "less or equal") compareMethod = CABLES.CG.DEPTH_COMPARE_LESSEQUAL;
    else if (m == "greater") compareMethod = CABLES.CG.DEPTH_COMPARE_GREATER;
    else if (m == "greater or equal") compareMethod = CABLES.CG.DEPTH_COMPARE_GREATEREQUAL;
    else if (m == "equal") compareMethod = CABLES.CG.DEPTH_COMPARE_EQUAL;
    else if (m == "not equal") compareMethod = CABLES.CG.DEPTH_COMPARE_NOTEQUAL;
}

render.onTriggered = function ()
{
    const cg = op.patch.cg;
    if (!cg) return;

    op.patch.cg.pushDepthTest(enable.get());
    op.patch.cg.pushDepthWrite(write.get());
    op.patch.cg.pushDepthFunc(cg.DEPTH_FUNCS[compareMethod]);

    trigger.trigger();

    op.patch.cg.popDepthTest();
    op.patch.cg.popDepthWrite();
    op.patch.cg.popDepthFunc();
};
