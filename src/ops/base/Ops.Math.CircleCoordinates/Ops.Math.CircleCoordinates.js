var inPos=op.inValueSlider("Position");
var inRadius=op.inValue("Radius",1);

var outX=op.outValue("X");
var outY=op.outValue("Y");

inPos.onChange=calc;
inRadius.onChange=calc;

function calc()
{
    var degInRad = (360*inPos.get())*CGL.DEG2RAD;
    outX.set(Math.sin(degInRad)*inRadius.get());
    outY.set(Math.cos(degInRad)*inRadius.get());
}

