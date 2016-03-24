this.name="Degree To Vector";

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));


var deg=this.addInPort(new Port(this,"degree"));
var x=this.addOutPort(new Port(this,"x"));
var y=this.addOutPort(new Port(this,"y"));
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