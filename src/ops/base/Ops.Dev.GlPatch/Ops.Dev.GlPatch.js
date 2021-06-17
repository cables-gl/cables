const
    render = op.inTrigger("Render"),
    refresh = op.inTriggerButton("Refresh"),
    next = op.inTrigger("Next");

const p = new CABLES.GLGUI.GlPatch(op.patch.cgl);
const api = new CABLES.GLGUI.GlPatchAPI(op.patch, p);

let firstTime = true;

refresh.onTriggered = function ()
{
    api.reset();
};

render.onTriggered = function ()
{
    if (firstTime)
    {
        api.reset();
        firstTime = false;
    }

    p.render(
        op.patch.cgl.canvasWidth,
        op.patch.cgl.canvasHeight
    );
    next.trigger();
};
