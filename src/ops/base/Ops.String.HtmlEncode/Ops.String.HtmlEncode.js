const
    instr = op.inString("String", "default"),
    result = op.outString("result");

instr.onChange = () =>
{
    const rawStr = instr.get() || "";
    const encodedStr = rawStr.replace(/[\u00A0-\u9999<>\&]/g, (i) => { return "&#" + i.charCodeAt(0) + ";"; });

    result.set(encodedStr);
};
