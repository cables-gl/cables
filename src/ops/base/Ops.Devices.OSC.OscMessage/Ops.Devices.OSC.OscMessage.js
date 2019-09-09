const
    inMessage=op.inObject("Message"),
    outAdd=op.outString("Adress"),
    outArr=op.outArray("Arguments"),
    outNum=op.outNumber("Total Arguments");

inMessage.onChange=function()
{
    const msg=inMessage.get();
    if(!msg || !msg.a || !msg.v)
    {
        outAdd.set("");
        outArr.set(null);
        return;
    }

    outAdd.set(msg.a);
    outNum.set(msg.a.length);
    outArr.set(msg.v);
};