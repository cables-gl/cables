Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='ViewPortSize';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.x=this.addOutPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
this.y=this.addOutPort(new Port(this,"y",OP_PORT_TYPE_VALUE));

this.width=this.addOutPort(new Port(this,"width",OP_PORT_TYPE_VALUE));
this.height=this.addOutPort(new Port(this,"height",OP_PORT_TYPE_VALUE));

var w=0,h=0,x=0,y=0;

this.exe.onTriggered=function()
{
    if(cgl.getViewPort()[0]!=x) w=self.x.val=cgl.getViewPort()[0];
    if(cgl.getViewPort()[1]!=y) h=self.y.val=cgl.getViewPort()[1];
    if(cgl.getViewPort()[2]!=h) h=self.width.val=cgl.getViewPort()[2];
    if(cgl.getViewPort()[3]!=w) w=self.height.val=cgl.getViewPort()[3];
    self.trigger.trigger();
};
