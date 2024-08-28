const
    inEle = op.inObject("Element", null, "element"),
    outStr = op.outString("CSS");

inEle.onChange = () =>
{
    const ele = inEle.get();
    if (!ele) return outStr.set("");

    let str = ele.style.cssText;
    str = str.replaceAll("; ", ";\n");
    outStr.set(str);

    // outStr.set(ele.style)
};
