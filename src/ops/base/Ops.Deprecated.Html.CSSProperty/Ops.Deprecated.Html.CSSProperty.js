var inStyle=op.inValueString("Style");
var inProperty=op.inValueString("Property");
var inValue=op.inValue("Value");
var inValueSuffix=op.inValueString("Value Suffix",'px');

var outStyle=op.outValue("Style Result");

inProperty.onChange=update;
inValue.onChange=update;
inStyle.onChange=update;
inValueSuffix.onChange=update;


function update()
{
    outStyle.set(inStyle.get()+inProperty.get()+':'+inValue.get()+inValueSuffix.get());
}