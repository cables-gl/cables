const dyn = op.addInPort(new CABLES.Port(op, "create port", CABLES.OP_PORT_TYPE_DYNAMIC));

function getPatchOp()
{
    for (let i in op.patch.ops)
    {
        if (op.patch.ops[i].patchId)
        {
            if (op.patch.ops[i].patchId.get() == op.uiAttribs.subPatch)
            {
                return op.patch.ops[i];
            }
        }
    }
}

dyn.onLinkChanged = () =>
{
    const mySubPatchOp = getPatchOp();

    if (!dyn.links.length) return;

    const otherPort = dyn.links[0].getOtherPort(dyn);
    dyn.removeLinks();

    const newPortName = mySubPatchOp.addNewOutPort(otherPort);

    const l = gui.scene().link(
        otherPort.parent,
        otherPort.getName(),
        op,
        newPortName);

    mySubPatchOp.saveData();
};
