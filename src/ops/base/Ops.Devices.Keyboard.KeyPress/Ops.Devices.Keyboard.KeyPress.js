this.name="KeyPress";

var cgl=this.patch.cgl;

var onPress=this.addOutPort(new Port(this,"on press",OP_PORT_TYPE_FUNCTION));
var keyCode=this.addOutPort(new Port(this,"key code",OP_PORT_TYPE_VALUE));

function onKeyPress(e)
{
    keyCode.set(e.keyCode);
    onPress.trigger();
}

this.onDelete=function()
{
    console.log("remove keypress op...");
    cgl.canvas.removeEventListener('keypress', onKeyPress);
};

cgl.canvas.addEventListener("keypress", onKeyPress );

console.log('keypress op');