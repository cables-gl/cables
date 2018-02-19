
var x1=op.addInPort(new Port(op,"x1"));
var y1=op.addInPort(new Port(op,"y1"));
var z1=op.addInPort(new Port(op,"z1"));

var x2=op.addInPort(new Port(op,"x2"));
var y2=op.addInPort(new Port(op,"y2"));
var z2=op.addInPort(new Port(op,"z2"));

var dist=op.addOutPort(new Port(op,"distance"));

function calc()
{
	var xd = x2.get()-x1.get();
	var yd = y2.get()-y1.get();
	var zd = z2.get()-z1.get();
	dist.set(Math.sqrt(xd*xd + yd*yd + zd*zd));
}


x1.onValueChanged=calc;
y1.onValueChanged=calc;
z1.onValueChanged=calc;
x2.onValueChanged=calc;
y2.onValueChanged=calc;
z2.onValueChanged=calc;


