var value=op.inValue("Value");
var trigger=op.outFunction("Trigger");

var lastValue=-Number.MAX_VALUE;

value.onChange=function()
{
    var v=value.get();
    if(v<lastValue)
    {
        trigger.trigger();
    }
    lastValue=v;
};
