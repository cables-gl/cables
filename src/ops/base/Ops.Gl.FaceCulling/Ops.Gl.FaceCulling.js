
var cgl=op.patch.cgl;

op.name='FaceCulling';
op.render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

op.enable=op.addInPort(new Port(op,"enable",OP_PORT_TYPE_VALUE,{ display:'bool' }));
op.enable.set(true);

op.facing=op.addInPort(new Port(op,"facing",OP_PORT_TYPE_VALUE ,{display:'dropdown',values:['back','front','both']} ));
op.facing.set('back');

var whichFace=cgl.gl.BACK;
op.render.onTriggered=function()
{

    if(op.enable.get()) cgl.gl.enable(cgl.gl.CULL_FACE);
    else cgl.gl.disable(cgl.gl.CULL_FACE);
    
    cgl.gl.cullFace(whichFace);

    op.trigger.trigger();

    cgl.gl.disable(cgl.gl.CULL_FACE);
};

op.facing.onValueChanged=function()
{
    whichFace=cgl.gl.BACK;
    if(op.facing.get()=='front')whichFace=cgl.gl.FRONT;
    if(op.facing.get()=='both')whichFace=cgl.gl.FRONT_AND_BACK;
};