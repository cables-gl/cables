const
    inIndex = op.inInt("Index", 0),
    inStrs = op.inMultiPort("Numbers", CABLES.OP_PORT_TYPE_NUMBER),
    outResult = op.outNumber("Number"),
    outNum = op.outNumber("Num Values");

inIndex.onChange =
inStrs.onChange = () =>
{
    const valuePorts = inStrs.get();
    const idx = Math.ceil(Math.min(valuePorts.length - 1, Math.max(0, inIndex.get())));

    outResult.set(valuePorts[idx].get());
    outNum.set(valuePorts.length);
};
