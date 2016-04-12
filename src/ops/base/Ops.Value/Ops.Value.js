var self=this;

this.name='Value';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var v=this.addInPort(new Port(this,"value",OP_PORT_TYPE_VALUE));

var result=this.addOutPort(new Port(this,"result"));

function frame(time)
{
    // self.updateAnims();
    self.exec();
}

var exec=function()
{
    var va=v.get();
    if(result.get()!=va) result.set(parseFloat(va));
};

exe.onTriggered=exec;
v.onValueChanged=exec;
