let val = op.inString("Value", 1);
let char = op.inString("Char", "0");
let num = op.inInt("Num", 4);
let out = op.outString("String");

val.onChange = update;
char.onChange = update;
num.onChange = update;

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
