op.name="Degree To Vector";

var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var deg=op.addInPort(new CABLES.Port(op,"degree"));
var x=op.addOutPort(new CABLES.Port(op,"x"));
var y=op.addOutPort(new CABLES.Port(op,"y"));

deg.set(-1);

function update()
{
    var rad=deg.get()*CGL.DEG2RAD;
    x.set(-1*Math.sin(rad));
    y.set(Math.cos(rad));
}

deg.onValueChange(update);
exe.onTriggered=update;

deg.set(0.0);