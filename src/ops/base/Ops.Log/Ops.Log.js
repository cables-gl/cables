Op.apply(this, arguments);
var self=this;

this.name='logger';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.input=this.addInPort(new Port(this,"input"));
this.input.set('');

this.exec=function()
{
    console.log("[log] " + self.input.get());
};

this.exe.onTriggered=this.exec;
this.input.onValueChanged=this.exec;