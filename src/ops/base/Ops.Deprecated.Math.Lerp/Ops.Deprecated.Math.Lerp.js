op.name="Lerp";

var v1=op.inValue("Value 1");
var amount=op.inValueSlider("Amount",0.5);
var v2=op.inValue("Value 2",1);
var result=op.outValue("Result");

amount.onChange=update;
v1.onChange=update;
v2.onChange=update;

function update()
{
    // var r=(v1.get()+v2.get())*amount.get();
    var r=(v1.get()*(1.0-amount.get())+v2.get()*amount.get());
    result.set(r);
}