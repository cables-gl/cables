const input = op.inFloat("input");
const result = op.outValue("result");

input.onChange = update;

function update()
{
    result.set(typeof (input.get()));
}
