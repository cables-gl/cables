const
    inStrs = op.inMultiPort("Strings", CABLES.OP_PORT_TYPE_STRING),
    outArr = op.outArray("Result"),
    outNum = op.outNumber("Num Values");

setUi();

function setUi()
{
    for (let i = 0; i < inStrs.get().length; i++)
    {
        inStrs.get()[i].setUiAttribs({ "display": "file" });
    }
}

inStrs.onChange = () =>
{
    const stringPorts = inStrs.get();
    let arr = [];

    setUi();

    for (let i = 0; i < stringPorts.length; i++)
    {
        arr[i] = stringPorts[i].get() || "";
    }
    outArr.set(arr);
    outNum.set(stringPorts.length);
};
