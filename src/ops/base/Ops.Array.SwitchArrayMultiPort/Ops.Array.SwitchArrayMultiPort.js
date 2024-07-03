const
    inIndex = op.inInt("Index", 0),
    inStrs = op.inMultiPort("Arrays", CABLES.OP_PORT_TYPE_ARRAY),
    outResult = op.outArray("Number"),
    outNum = op.outNumber("Num Values");

inIndex.onChange =
inStrs.onChange = () =>
{
    const valuePorts = inStrs.get();
    const idx = Math.ceil(Math.min(valuePorts.length - 1, Math.max(0, inIndex.get())));

    outResult.setRef(valuePorts[idx].get());
    outNum.set(valuePorts.length);
};
