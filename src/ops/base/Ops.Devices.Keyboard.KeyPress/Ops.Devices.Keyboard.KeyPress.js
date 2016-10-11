op.name="KeyPress";

var cgl=op.patch.cgl;

var onPress=op.addOutPort(new Port(op,"on press",OP_PORT_TYPE_FUNCTION));
var keyCode=op.addOutPort(new Port(op,"key code",OP_PORT_TYPE_VALUE));

function onKeyPress(e)
{
    keyCode.set(e.keyCode);
    onPress.trigger();
}

op.onDelete=function()
{
    cgl.canvas.removeEventListener('keypress', onKeyPress);
};

cgl.canvas.addEventListener("keypress", onKeyPress );
