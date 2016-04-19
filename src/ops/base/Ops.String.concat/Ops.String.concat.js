op.name='Concat';

var string1=op.addInPort(new Port(op,"string1",OP_PORT_TYPE_VALUE,{type:'string'}));
var string2=op.addInPort(new Port(op,"string2",OP_PORT_TYPE_VALUE,{type:'string'}));

var result=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_VALUE,{type:'string'}));


function exec()
{
    result.set( String(string1.get())+String(string2.get()));
}

string1.onValueChanged=exec;
string2.onValueChanged=exec;

string1.set('ABC');
string2.set('XYZ');
