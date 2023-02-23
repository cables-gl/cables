
const SubPatchOp = class
{
    constructor(op)
    {
        this._op = op;

        op.patchId = op.addInPort(new CABLES.Port(op, "patchId", CABLES.OP_PORT_TYPE_STRING, { "display": "readonly", "isSubPatchOpExposable": true }));

        // op.patchId.setUiAttribs({ "hideParam": true });

        if (op.uiAttribs.parentOfSubpatch)
        {
            op.patchId.set(op.uiAttribs.parentOfSubpatch);
        }
        else
        {
            let newPatchId = CABLES.generateUUID();
            op.patchId.set(newPatchId);
        }
    }
};

CABLES.SubPatchOp = SubPatchOp;
