const inValue=op.inValue("Value");
const result=op.outValue("Result");

inValue.onChange=update;
update();

function update()
{
    result.set(1-inValue.get());
}

