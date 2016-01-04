    var self=this;
    CABLES.Op.apply(this, arguments);

    this.name='PatchInput';

    this.getPatchOp=function()
    {
        for(var i in self.patch.ops)
        {
            if(self.patch.ops[i].patchId)
            {
                if(self.patch.ops[i].patchId.val==self.uiAttribs.subPatch)
                {
                    return self.patch.ops[i];
                }
            }
        }
    };
