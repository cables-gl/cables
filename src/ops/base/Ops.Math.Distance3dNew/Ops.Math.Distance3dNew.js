
var calc=op.inFunctionButton("Calc");
var next=op.outFunction("Next");

var inMin=op.inValue("Min",0);


var x1=op.addInPort(new Port(op,"x1"));
var y1=op.addInPort(new Port(op,"y1"));
var z1=op.addInPort(new Port(op,"z1"));

var x2=op.addInPort(new Port(op,"x2"));
var y2=op.addInPort(new Port(op,"y2"));
var z2=op.addInPort(new Port(op,"z2"));

var dist=op.addOutPort(new Port(op,"distance"));

var min=inMin.get();

// inMax.onChange=minMaxChange;
inMin.onChange=function()
{
    min=inMin.get();
    console.log(min);
};


calc.onTriggered=function()
{
	var xd = x2.get()-x1.get();
	if( Math.abs(xd) > min )return;
	
	var yd = y2.get()-y1.get();
	if( Math.abs(yd) > min )return;

	var zd = z2.get()-z1.get();
	if( Math.abs(zd) > min )return;

	dist.set(Math.sqrt(xd*xd + yd*yd + zd*zd));

	next.trigger();
};


