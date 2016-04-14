this.name='String';
var v=this.addInPort(new Port(this,"value",OP_PORT_TYPE_VALUE,{type:'string'}));

var result=this.addOutPort(new Port(this,"result"));

v.onValueChanged=function()
{
    if(result.get()!=v.get()) result.set(v.get());
};

v.set('');