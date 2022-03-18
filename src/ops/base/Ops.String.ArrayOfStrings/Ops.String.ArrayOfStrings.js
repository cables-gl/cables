const
    inStr = op.inString("String", "default"),
    inLength = op.inInt("Length", 10),
    inAttachNum = op.inBool("Attach Number", false),
    outArr = op.outArray("Array");

inStr.onChange =
    inLength.onChange =
    inAttachNum.onChange = update;

function update()
{
    let arr = [];
    let str = inStr.get();
    let l = inLength.get();

    if (inAttachNum.get())
        for (let i = 0; i < l; i++)
            arr[i] = str + i;
    else
        for (let i = 0; i < l; i++)
            arr[i] = str;

    outArr.set(arr);
}
