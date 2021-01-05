let val = op.inValue("Value", 1);
let char = op.inValueString("Char", "0");
let num = op.inValueInt("Num", 4);
let out = op.outValue("String");

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
