const
    inValue = op.inValue("Value"),
    result = op.outNumber("Result");

inValue.onChange = update;
update();

function update()
{
    result.set(1 - inValue.get());
}
