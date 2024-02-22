const
    val = op.inString("Value", 1),
    char = op.inString("Char", "0"),
    num = op.inInt("Num", 4),
    out = op.outString("String");

val.onChange =
    char.onChange =
    num.onChange = update;
update();

function update()
{
    let v = val.get();
    let n = num.get();

    let pad = "";
    for (let i = 0; i < n; i++)pad += ("" + char.get());

    let str = v + "";
    str = pad.substring(0, pad.length - str.length) + str;

    out.set(str);
}
