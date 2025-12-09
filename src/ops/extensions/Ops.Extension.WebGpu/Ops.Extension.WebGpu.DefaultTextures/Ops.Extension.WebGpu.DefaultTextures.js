const
    which = op.inSwitch("Texture", ["Default", "Error", "Empty"], "Default"),
    outTex = op.outTexture("Result");

new CABLES.WebGpuOp(op);

op.on("init", update);
which.onChange = update;

function update()
{
    op.patch.cgp.addNextFrameOnceCallback(() =>
    {
        if (which.get() == "Default")outTex.setRef(op.patch.cgp.getDefaultTexture());
        if (which.get() == "Empty")outTex.setRef(op.patch.cgp.getEmptyTexture());
        if (which.get() == "Error")outTex.setRef(op.patch.cgp.getErrorTexture());
    });
}
