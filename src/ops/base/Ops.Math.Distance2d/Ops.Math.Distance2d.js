this.name="Distance2d";

var x1=this.addInPort(new Port(this,"x1"));
var y1=this.addInPort(new Port(this,"y1"));

var x2=this.addInPort(new Port(this,"x2"));
var y2=this.addInPort(new Port(this,"y2"));

var dist=this.addOutPort(new Port(this,"distance"));

function calc()
{
	var xd = x2.get()-x1.get();
	var yd = y2.get()-y1.get();
	dist.set(Math.sqrt(xd*xd + yd*yd));
}


x1.onValueChanged=calc;
y1.onValueChanged=calc;
x2.onValueChanged=calc;
y2.onValueChanged=calc;


