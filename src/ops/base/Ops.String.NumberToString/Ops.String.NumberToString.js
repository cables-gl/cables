op.name="NumberToString";

var val=op.addInPort(new CABLES.Port(op,"Number",CABLES.OP_PORT_TYPE_VALUE));
var result=op.addOutPort(new CABLES.Port(op,"Result",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));

function update()
{
    result.set( ''+String(val.get()||0));
}

val.onChange=update;
update();