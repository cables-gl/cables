const
    inIndex = op.inInt("Index", 0),
    inObjs = op.inMultiPort("Objects", CABLES.OP_PORT_TYPE_OBJECT),
    outResult = op.outObject("Object"),
    outNum = op.outNumber("Num Values");

inIndex.onChange =
inObjs.onChange = () =>
{
    const valuePorts = inObjs.get();
    const idx = Math.ceil(Math.min(valuePorts.length - 1, Math.max(0, inIndex.get())));

    outResult.setRef(valuePorts[idx].get());
    outNum.set(valuePorts.length);
};
