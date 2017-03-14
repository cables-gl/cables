op.name="Difference";

var num1 = op.inValue("Number A");
var num2 = op.inValue("Number B");

var result=op.outValue("Result");

num1.onChange=update;
num2.onChange=update;

function update()
{
    var r=num1.get()-num2.get();
    
    r=Math.abs(r);
    
    result.set(r);
    
}