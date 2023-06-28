
const subpatchInputOpName = "Ops.Dev.Ui.PatchInput";
const subpatchOutputOpName = "Ops.Dev.Ui.PatchOutput";

const SubPatchOp = class
{
    constructor(op, options)
    {
        options = options || {};
        this._op = op;

        op.patchId = op.addInPort(new CABLES.Port(op, "patchId", CABLES.OP_PORT_TYPE_STRING, { "display": "readonly" }));

        op.setUiAttribs({ "subPatchOp": { "version": 2 } });


        if (op.uiAttribs.parentOfSubpatch)
        {
            op.patchId.set(op.uiAttribs.parentOfSubpatch);
        }
        else
        {
            if (options.subId) op.patchId.set(options.subId);
            else op.patchId.set(CABLES.generateUUID());
        }

        op.patchId.onChange = () =>
        {
            console.log("patchid change.nope...");

            if (options.subId) op.patchId.value = options.subId;
            // else op.patchId.value=CABLES.uuid();
        };

        op.patch.on("subpatchCreated", () => { this.createInOutOps(); });
        op.on("loadedValueSet", () => { this.createInOutOps(); });


        op.init = () =>
        {
            op.setStorage({ "subPatchVer": 2 });
        };

        op.on("delete", () =>
        {
            for (let i = op.patch.ops.length - 1; i >= 0; i--)
                if (op.patch.ops[i] && op.patch.ops[i].uiAttribs && op.patch.ops[i].uiAttribs.subPatch == op.patchId.get())
                    op.patch.deleteOp(op.patch.ops[i].id);
        });

        this._op.isExposableSubpatchOp = () =>
        {
            return true;
        };
    }

    get patchId()
    {
        return this._op.patchId.get();
    }

    createInOutOps()
    {
        let patchInputOP = this._op.patch.getSubPatchOp(this.patchId, subpatchInputOpName);
        let patchOutputOP = this._op.patch.getSubPatchOp(this.patchId, subpatchOutputOpName);

        if (!patchInputOP) this._op.patch.addOp(subpatchInputOpName, { "subPatch": this.patchId, "translate": { "x": 0, "y": 0 } });
        if (!patchOutputOP) this._op.patch.addOp(subpatchOutputOpName, { "subPatch": this.patchId, "translate": { "x": 0, "y": 0 } });

        // todo: move to correct positions...
    }
};

CABLES.SubPatchOp = SubPatchOp;
