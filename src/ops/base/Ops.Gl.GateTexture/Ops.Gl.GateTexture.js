const
    valueInPort = op.inTexture("Object In"),
    passThroughPort = op.inValueBool("Pass Through", true),
    inIfNull = op.inSwitch("When False", ["keep last texture", "empty texture"], "keep last texture"),
    onlyValid = op.inValueBool("Only Valid Textures", true),
    valueOutPort = op.outTexture("Object Out");

valueInPort.onChange =
    inIfNull.onChange =
    passThroughPort.onChange = update;

valueInPort.changeAlways = true;

function update()
{
    if (!valueInPort.get() && onlyValid.get()) return;
    if (passThroughPort.get()) valueOutPort.setRef(valueInPort.get());
    else
    {
        if (inIfNull.get() == "empty texture") valueOutPort.setRef(CGL.Texture.getEmptyTexture(op.patch.cgl));
    }
}
