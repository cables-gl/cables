this.name="ParseArray";

var text=this.addInPort(new Port(this,"text",OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
var separator=this.addInPort(new Port(this,"separator",OP_PORT_TYPE_VALUE,{type:'string'}));
separator.set(',');

text.set('1,2,3');
var arr=this.addOutPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));
var len=this.addOutPort(new Port(this,"length",OP_PORT_TYPE_ARRAY));

function parse()
{
    var r=text.get().split(separator.get());
    len.set(r.length);
    arr.set(r);
}

text.onValueChanged=parse;
separator.onValueChanged=parse;