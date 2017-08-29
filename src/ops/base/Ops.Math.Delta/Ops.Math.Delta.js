op.name="ValueDelta";

var val=op.inValue("Value");
var result=op.outValue("Delta");

var oldVal=0;

val.onValueChanged=function()
{
    var change=oldVal-val.get();
    oldVal=val.get();
    result.set(change);
};

