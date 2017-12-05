var inValue=op.inValue("Value");

var result=op.outValue("Result");

inValue.onChange=update;
update();

function update()
{
    result.set(1-inValue.get());
}

