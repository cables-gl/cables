this.name='PatchInput';

op.getPatchOp=function()
{
    for(var i in op.patch.ops)
    {
        if(op.patch.ops[i].patchId)
        {
            if(op.patch.ops[i].patchId.val==op.uiAttribs.subPatch)
            {
                return op.patch.ops[i];
            }
        }
    }
};
