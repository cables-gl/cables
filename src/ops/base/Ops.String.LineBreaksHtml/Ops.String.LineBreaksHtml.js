const
    inStr = op.inString("String", ""),
    inNum = op.inInt("Add Num Breaks", 1),
    inActive = op.inBool("Active", true),
    outStr = op.outString("HTML");

inActive.onChange =
inNum.onChange =
inStr.onChange = function ()
{
    let str = inStr.get();

    if (!inActive.get()) return outStr.set(str);
    let newlines = "";

    for (let i = 0; i < inNum.get(); i++) newlines += "<br/>";

    if (str) str = str.replace(/(?:\r\n|\r|\n)/g, newlines);
    outStr.set(str);
};
