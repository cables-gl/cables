this.name="ParseArray";

var text=this.addInPort(new Port(this,"text",OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
text.set('1,2,3');
var arr=this.addOutPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));

function parse()
{
    var r=text.get().split(' ');
    console.log('array length '+r.length);
    // this.log(arr);
    arr.set(r);
}

text.onValueChanged=parse;
