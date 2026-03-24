const
    cgl = op.patch.cgl,
    inObjs = op.inMultiPort2("Textures", CABLES.OP_PORT_TYPE_TEXTURE),
    outResult = op.outArray("Texture Array", null),
    outNum = op.outNumber("Num Textures");

const arr = [];
inObjs.onChange = () =>
{
    const valuePorts = inObjs.get();
    for (let index = 0; index < valuePorts.length; index++)
    {
        arr[index] = valuePorts[index].get();
    }
    arr.length = valuePorts.length;

    outResult.setRef(arr);
    outNum.set(valuePorts.length);
};
