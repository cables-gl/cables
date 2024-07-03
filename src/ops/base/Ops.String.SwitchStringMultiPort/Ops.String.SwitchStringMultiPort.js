const
    inIndex = op.inInt("Index", 0),
    inStrs = op.inMultiPort("Strings", CABLES.OP_PORT_TYPE_STRING),
    outResult = op.outString("String"),
    outNum = op.outNumber("Num Values");

inIndex.onChange =
inStrs.onChange = () =>
{
    const valuePorts = inStrs.get();
    const idx = Math.ceil(Math.min(valuePorts.length - 1, Math.max(0, inIndex.get())));

    outResult.set(valuePorts[idx].get());
    outNum.set(valuePorts.length);
};
