const
    parentPort = op.inObject("Parent", null, "element"),
    outStr = op.outString("HTML String");

parentPort.onChange = () =>
{
    if (parentPort.get())
        outStr.set(parentPort.get().outerHTML);
    else outStr.set("");
};
