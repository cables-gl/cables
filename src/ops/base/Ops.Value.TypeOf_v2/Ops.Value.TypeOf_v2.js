const input = op.inValue("input");
const result = op.outString("result");

input.onChange = update;

function update()
{
    result.set(typeof (input.get()));
}
