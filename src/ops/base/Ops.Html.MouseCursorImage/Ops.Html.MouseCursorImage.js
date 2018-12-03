
var filename=op.addInPort(new CABLES.Port(op,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));

var trigger=op.inTriggerButton("Set Cursor");

function update()
{
    var str='url('+filename.get()+') 0 0, auto';
    op.patch.cgl.canvas.style.cursor = str;
}

filename.onChange=update;
trigger.onTriggered=update;
