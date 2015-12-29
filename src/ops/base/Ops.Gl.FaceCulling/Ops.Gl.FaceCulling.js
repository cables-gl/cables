Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='FaceCulling';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.enable=this.addInPort(new Port(this,"enable",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.enable.val=true;

this.facing=this.addInPort(new Port(this,"facing",OP_PORT_TYPE_VALUE ,{display:'dropdown',values:['back','front','both']} ));
this.facing.val='back';

var whichFace=cgl.gl.BACK;
this.render.onTriggered=function()
{
    cgl.gl.cullFace(whichFace);

    if(self.enable.val) cgl.gl.enable(cgl.gl.CULL_FACE);
    else cgl.gl.disable(cgl.gl.CULL_FACE);

    self.trigger.trigger();

    cgl.gl.disable(cgl.gl.CULL_FACE);
};

this.facing.onValueChanged=function()
{
    whichFace=cgl.gl.BACK;
    if(self.facing.get()=='front')whichFace=cgl.gl.FRONT;
    if(self.facing.get()=='both')whichFace=cgl.gl.FRONT_AND_BACK;
};