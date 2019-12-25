const
    STR_FRONT="Front Sides",
    STR_BACK="Back Sides",
    STR_BOTH="All",
    render=op.inTrigger("render"),
    trigger=op.outTrigger("trigger"),
    facing=op.inSwitch("Discard",[STR_BACK,STR_FRONT,STR_BOTH],STR_BACK),
    enable=op.inValueBool("Active",true),
    cgl=op.patch.cgl;

op.setPortGroup("Face Fulling",[enable,facing]);
var whichFace=cgl.gl.BACK;

render.onTriggered=function()
{
    cgl.pushCullFace(enable.get());
    cgl.pushCullFaceFacing(whichFace);

    trigger.trigger();

    cgl.popCullFace(enable.get());
    cgl.popCullFaceFacing(whichFace);
};

facing.onChange=function()
{
    whichFace=cgl.gl.BACK;
    if(facing.get()==STR_FRONT) whichFace=cgl.gl.FRONT;
    else if(facing.get()==STR_BOTH) whichFace=cgl.gl.FRONT_AND_BACK;
};