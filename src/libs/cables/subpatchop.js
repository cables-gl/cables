const SubPatchOp = class
{
    constructor(op, options)
    {
        options = options || {};
        this._op = op;

        op.patchId = op.addInPort(new CABLES.Port(op, "patchId", CABLES.OP_PORT_TYPE_STRING, { "display": "readonly", "hidePort": true, "hideParam": true }));

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
        };

        op.init = () =>
        {
            op.setStorage({ "subPatchVer": 2 });
        };

        op.loadDependencies = (p, next) =>
        {
            if (CABLES.UI)
            {
                gui.serverOps.loadProjectDependencies(p, () =>
                {
                    if (next)next();
                });
            }
            else
            if (next)next();
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
};

CABLES.SubPatchOp = SubPatchOp;
