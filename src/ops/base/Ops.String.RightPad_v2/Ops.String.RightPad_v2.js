const
    val = op.inString("Value", 1),
    char = op.inString("Char", "0"),
    num = op.inValueInt("Num", 4),
    out = op.outString("String");

val.onChange =
char.onChange =
num.onChange = update;
update();
function update()
{
    let str = val.get() + "";
    for (let i = str.length; i < num.get(); i++)
    {
        str += char.get();
    }
    out.set(str);
}
