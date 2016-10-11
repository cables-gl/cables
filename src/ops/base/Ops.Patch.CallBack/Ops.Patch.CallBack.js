op.name='callback';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var callbackname=op.addInPort(new Port(op,"callback name",OP_PORT_TYPE_VALUE,{type:'string'}));
var val0=op.addInPort(new Port(op,"value 1",OP_PORT_TYPE_VALUE,{type:'string'}));
var val1=op.addInPort(new Port(op,"value 2",OP_PORT_TYPE_VALUE,{type:'string'}));
var val2=op.addInPort(new Port(op,"value 3",OP_PORT_TYPE_VALUE,{type:'string'}));

var values=[0,0,0];

val0.onValueChanged=function(){ values[0]=val0.get(); };
val1.onValueChanged=function(){ values[1]=val1.get(); };
val2.onValueChanged=function(){ values[2]=val2.get(); };

exe.onTriggered=function()
{
    if(op.patch.config.hasOwnProperty(callbackname.get()))
    {
        op.log('has callback!',callbackname.get());
        op.patch.config[callbackname.get()](values);
    }
    else
    {
        op.log('callback not found!',callbackname.get());
    }
};

