const
    cgl = op.patch.cgl,
    inIndex = op.inInt("Index", 0),
    inObjs = op.inMultiPort("Textures", CABLES.OP_PORT_TYPE_OBJECT),
    outResult = op.outTexture("Texture", CGL.Texture.getEmptyTexture(cgl)),
    outNum = op.outNumber("Num Textures");

inIndex.onChange =
inObjs.onChange = () =>
{
    const valuePorts = inObjs.get();
    const idx = Math.min(valuePorts.length - 1, Math.max(0, inIndex.get()));

    outResult.setRef(valuePorts[idx].get() || CGL.Texture.getEmptyTexture(cgl));
    outNum.set(valuePorts.length);
};
