var calc=op.inTriggerButton("Calc");

var x1=op.inValueFloat("x1");
var y1=op.inValueFloat("y1");
var z1=op.inValueFloat("z1");

var x2=op.inValueFloat("x2");
var y2=op.inValueFloat("y2");
var z2=op.inValueFloat("z2");

var inMin=op.inValue("Min",0);

op.setPortGroup("Point 1",[x1,y1,z1]);
op.setPortGroup("Point 2",[x2,y2,z2]);

var next=op.outTrigger("Next");
var dist=op.addOutPort(new CABLES.Port(op,"distance"));

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


