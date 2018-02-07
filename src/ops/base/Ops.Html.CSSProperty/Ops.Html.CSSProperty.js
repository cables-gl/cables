var inStyle=op.inValueString("Style");
var inProperty=op.inValueString("Property");
var inValue=op.inValue("Value");
var inValueSuffix=op.inValue("Value Suffix",'px');

var outStyle=op.outValue("Style Result");

inProperty.onChange=update;
inValue.onChange=update;
inStyle.onChange=update;

function update()
{
    outStyle.set(inStyle.get()+inProperty.get()+':'+inValue.get()+inValueSuffix.get());
}