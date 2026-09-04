var val=op.addInPort(new CABLES.Port(op,"Number",CABLES.Port.TYPE_VALUE));
var result=op.addOutPort(new CABLES.Port(op,"Result",CABLES.Port.TYPE_VALUE,{type:'string'}));

function update()
{
    result.set( ''+String(val.get()||0));
}

val.onChange=update;
update();