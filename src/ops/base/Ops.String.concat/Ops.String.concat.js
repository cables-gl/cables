op.name='Concat';

var string1=op.addInPort(new Port(op,"string1",OP_PORT_TYPE_VALUE,{type:'string'}));
var string2=op.addInPort(new Port(op,"string2",OP_PORT_TYPE_VALUE,{type:'string'}));

var result=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_VALUE));

// result.ignoreValueSerialize=true;


function exec()
{
    result.set(string1.get()+''+string2.get());
    
    console.log('concat '+result.get());
}

string1.onValueChanged=exec;
string2.onValueChanged=exec;

string1.val='wurst';
string2.val='tuete';
