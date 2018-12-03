var val1=op.inValue("Value 1");
var val2=op.inValue("Value 2");
var perc=op.inValueSlider("Percentage");

var result=op.outValue("Result");

function update()
{
    result.set( (val2.get()-val1.get())*perc.get()+val1.get() );
}

val1.onChange=update;
val2.onChange=update;
perc.onChange=update;
