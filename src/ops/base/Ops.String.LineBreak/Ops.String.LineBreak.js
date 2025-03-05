const
    inStr = op.inString("String"),
    outStr = op.outString("Result", "\n");

inStr.onChange = () =>
{
    outStr.set(inStr.get() + "\n");
};
