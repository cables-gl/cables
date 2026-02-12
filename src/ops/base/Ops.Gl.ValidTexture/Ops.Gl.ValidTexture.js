const
    inTex = op.inTexture("Texture"),
    inWhich = op.inSwitch("Default", ["Empty", "Stripes"], "Empty"),
    outTex = op.outTexture("Result"),
    isValid = op.outBoolNum("Is Valid");

let tex = CGL.Texture.getEmptyTexture(op.patch.cgl);

inTex.onChange = update;

inWhich.onChange = function ()
{
    if (inWhich.get() == "Empty")tex = CGL.Texture.getEmptyTexture(op.patch.cgl);
    else tex = CGL.Texture.getTempTexture(op.patch.cgl);
    update();
};

function update()
{
    let t = inTex.get();

    if (!t || t == CGL.Texture.getErrorTexture(op.patch.cgl))
    {
        t = tex;
        isValid.set(false);
    }
    else
    {
        isValid.set(true);
    }

    outTex.set(t);
}
