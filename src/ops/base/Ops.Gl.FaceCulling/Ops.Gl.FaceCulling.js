const
    render=op.inTrigger("render"),
    trigger=op.outTrigger("trigger"),
    enable=op.inValueBool("enable",true),
    facing=op.inSwitch("facing",['back','front','both'],'back'),
    cgl=op.patch.cgl;

var whichFace=cgl.gl.BACK;

render.onTriggered=function()
{
    if(enable.get()) cgl.gl.enable(cgl.gl.CULL_FACE);
        else cgl.gl.disable(cgl.gl.CULL_FACE);

    cgl.gl.cullFace(whichFace);
    trigger.trigger();
    cgl.gl.disable(cgl.gl.CULL_FACE);
};

facing.onChange=function()
{
    whichFace=cgl.gl.BACK;
    if(facing.get()=='front') whichFace=cgl.gl.FRONT;
        else if(facing.get()=='both') whichFace=cgl.gl.FRONT_AND_BACK;
};