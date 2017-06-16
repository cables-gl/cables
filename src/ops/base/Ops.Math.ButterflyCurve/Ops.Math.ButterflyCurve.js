op.name="ButterflyCurve";

var inVal=op.inValue("Value");

var outX=op.outValue("X");
var outY=op.outValue("Y");

inVal.onChange=update;

function update()
{
    var t=inVal.get();

    var x = Math.cos(t) * Math.pow(Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.sin(t / 12) , 2);
    var y = Math.sin(t) * Math.pow(Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.sin(t / 12) , 2);
    
    outX.set(x);
    outY.set(y);
}
