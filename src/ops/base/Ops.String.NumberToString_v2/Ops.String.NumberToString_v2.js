const
    val = op.inValue("Number"),
    result = op.outString("Result");

op.setUiAttrib({ "title": "num2str" });

val.onChange = update;
update();

function update()
{
    result.set(String(val.get() || 0));
}
