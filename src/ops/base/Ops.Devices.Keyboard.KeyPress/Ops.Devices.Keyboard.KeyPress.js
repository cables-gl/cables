var cgl=op.patch.cgl;

var onPress=op.addOutPort(new CABLES.Port(op,"on press",CABLES.OP_PORT_TYPE_FUNCTION));
var keyCode=op.addOutPort(new CABLES.Port(op,"key code",CABLES.OP_PORT_TYPE_VALUE));
var char=op.outValue("Char");

function onKeyPress(e)
{
    char.set(e.key);
    keyCode.set(e.keyCode);
    onPress.trigger();
}

op.onDelete=function()
{
    cgl.canvas.removeEventListener('keypress', onKeyPress);
};

cgl.canvas.addEventListener("keypress", onKeyPress );
