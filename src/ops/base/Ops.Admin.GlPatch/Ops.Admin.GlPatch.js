const
    render=op.inTrigger("Render"),
    refresh=op.inTriggerButton("Refresh"),
    inScrollX=op.inValueFloat("Scroll X"),
    inScrollY=op.inValueFloat("Scroll Y"),
    inMouseX=op.inValueFloat("Mouse X"),
    inMouseY=op.inValueFloat("Mouse Y"),
    inMouseButton=op.inValueFloat("MouseButton"),
    inZoom=op.inValueFloat("Zoom"),
    inFont=op.inTexture("SDF Font"),
    next=op.inTrigger("Next");

var p=new CABLES.GLGUI.GlPatch(op.patch.cgl);
var api=new CABLES.GLGUI.GlPatchAPI(op.patch,p);

var firstTime=true;

refresh.onTriggered=function()
{
    api.reset();
};

render.onTriggered=function()
{
    if(firstTime)
    {
        api.reset();
        firstTime=false;
    }

    p.setFont(inFont.get());

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