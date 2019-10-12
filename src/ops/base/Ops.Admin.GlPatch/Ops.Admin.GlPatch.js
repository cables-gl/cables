const
    render=op.inTrigger("Render"),
    refresh=op.inTriggerButton("Refresh"),
    inScrollX=op.inValueFloat("Scroll X"),
    inScrollY=op.inValueFloat("Scroll Y"),
    inMouseX=op.inValueFloat("Mouse X"),
    inMouseY=op.inValueFloat("Mouse Y"),
    inMouseButton=op.inValueFloat("MouseButton"),
    inZoom=op.inValueFloat("Zoom"),
    next=op.inTrigger("Next");

var p=new CABLES.GLGUI.GlPatch(CABLES.patch);
var api=new CABLES.GLGUI.GlPatchAPI(op.patch,p);

var firstTime=true;

refresh.onTriggered=function()
{
    p.reset();
};

render.onTriggered=function()
{
    if(firstTime)
    {
        p.reset();
        firstTime=false;
    }

    p.render(
        op.patch.cgl.canvasWidth,
        op.patch.cgl.canvasHeight,
        inScrollX.get(),
        inScrollY.get(),
        inZoom.get(),
        inMouseX.get(),
        inMouseY.get(),
        inMouseButton.get()
        );
    next.trigger();

};