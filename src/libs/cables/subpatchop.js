
const subpatchInputOpName = "Ops.Ui.SubPatchInput";
const subpatchOutputOpName = "Ops.Ui.SubPatchOutput";

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
            if (op.patch.clearSubPatchCache)op.patch.clearSubPatchCache(this.patchId);
            const ops = op.patch.ops;
            for (let i = ops.length - 1; i >= 0; i--)
                if (ops[i] && ops[i].uiAttribs && ops[i].uiAttribs.subPatch == op.patchId.get())
                    op.patch.deleteOp(ops[i].id);
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
        if (this._op.patch.clearSubPatchCache) this._op.patch.clearSubPatchCache(this.patchId);

        let patchInputOP = this._op.patch.getSubPatchOp(this.patchId, subpatchInputOpName);
        let patchOutputOP = this._op.patch.getSubPatchOp(this.patchId, subpatchOutputOpName);

        // console.log("this.patchId", this.patchId, patchInputOP);

        if (!patchInputOP)console.log("CREATE INPUT OP!!!!!!!!!!!!", this.patchId);

        if (!patchInputOP) this._op.patch.addOp(subpatchInputOpName, { "subPatch": this.patchId, "translate": { "x": 0, "y": 0 } });
        if (!patchOutputOP) this._op.patch.addOp(subpatchOutputOpName, { "subPatch": this.patchId, "translate": { "x": 0, "y": 0 } });

        // todo: move to correct positions...
    }
};

CABLES.SubPatchOp = SubPatchOp;
