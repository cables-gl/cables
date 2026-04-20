const idx = op.inValueInt("Index"),
    result = op.outString("Result"),
    inStrs = op.inMultiPort2("File", CABLES.OP_PORT_TYPE_STRING, { "display": "file" }, 5),
    outNum = op.outNumber("Num Values");

setUi();

function setUi()
{
    if (CABLES.UI)
        for (let i = 0; i < inStrs.get().length; i++)
        {
            inStrs.get()[i].setUiAttribs({ "display": "file" });
        }
}

function update()
{
    setUi();

    const stringPorts = inStrs.get();

    const index = idx.get();
    if (index >= 0 && stringPorts[index])
    {
        result.set(stringPorts[index].get());
    }
    else result.set("");
}

idx.onChange =
inStrs.onChange = () =>
{
    // const stringPorts = inStrs.get();
    // let arr = [];

    // setUi();

    // for (let i = 0; i < stringPorts.length; i++)
    // {
    //     arr[i] = stringPorts[i].get() || "";
    // }
    // outArr.set(arr);
    // outNum.set(stringPorts.length);
    update();
};
