
const subpatchInputOpName = "Ops.Dev.Ui.PatchInput";
const subpatchOutputOpName = "Ops.Dev.Ui.PatchOutput";

const SubPatchOp = class
{
    constructor(op)
    {
        this._op = op;

        op.patchId = op.addInPort(new CABLES.Port(op, "patchId", CABLES.OP_PORT_TYPE_STRING, { "display": "readonly", "isSubPatchOpExposable": true }));

        if (op.uiAttribs.parentOfSubpatch)
        {
            op.patchId.set(op.uiAttribs.parentOfSubpatch);
        }
        else
        {
            let newPatchId = CABLES.generateUUID();
            op.patchId.set(newPatchId);
        }

        op.patch.on("subpatchCreated", () => { this.createInOutOps(); });
        op.on("loadedValueSet", () => { this.createInOutOps(); });
    }

    createInOutOps()
    {
        let patchInputOP = this._op.patch.getSubPatchOp(this._op.patchId.get(), subpatchInputOpName);
        let patchOutputOP = this._op.patch.getSubPatchOp(this._op.patchId.get(), subpatchOutputOpName);

        if (!patchInputOP) this._op.patch.addOp(subpatchInputOpName, { "subPatch": this._op.patchId.get(), "translate": { "x": 0, "y": 0 } });
        if (!patchOutputOP) this._op.patch.addOp(subpatchOutputOpName, { "subPatch": this._op.patchId.get(), "translate": { "x": 0, "y": 0 } });

        // todo: move to correct positions...
    }
};

CABLES.SubPatchOp = SubPatchOp;
