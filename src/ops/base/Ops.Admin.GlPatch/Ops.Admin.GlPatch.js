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
    next=op.outTrigger("Next");

var p=null;
var api=null;

var firstTime=true;

refresh.onTriggered=init;

inFont.onChange=function()
{
    if(p)p.setFont(inFont.get());

};



function init()
{
    // p.reset();
    // p=null;

    p=new CABLES.GLGUI.GlPatch(CABLES.patch);
    api=new CABLES.GLGUI.GlPatchAPI(op.patch,p);
    firstTime=true;

}

render.onTriggered=function()
{
    if(!p)init();

    if(firstTime)
    {
        p.reset();
        firstTime=false;
        p.setFont(inFont.get());
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