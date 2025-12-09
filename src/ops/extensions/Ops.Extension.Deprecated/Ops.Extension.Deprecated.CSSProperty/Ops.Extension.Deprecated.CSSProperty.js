let inStyle = op.inValueString("Style");
let inProperty = op.inValueString("Property");
let inValue = op.inValue("Value");
let inValueSuffix = op.inValueString("Value Suffix", "px");

let outStyle = op.outValue("Style Result");

inProperty.onChange = update;
inValue.onChange = update;
inStyle.onChange = update;
inValueSuffix.onChange = update;

function update()
{
    outStyle.set(inStyle.get() + inProperty.get() + ":" + inValue.get() + inValueSuffix.get());
}
