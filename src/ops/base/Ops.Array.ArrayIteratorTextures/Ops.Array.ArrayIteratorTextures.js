const
    exe = op.inTrigger("exe"),
    arr = op.inArray("array"),
    trigger = op.outTrigger("trigger"),
    finished = op.outTrigger("finished"),
    idx = op.outNumber("index"),
    val = op.outObject("value", null, "texture");

exe.onTriggered = function ()
{
    const theArr = arr.get();
    if (!theArr)
    {
        val.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
        return;
    }

    for (let i = 0; i < theArr.length; i++)
    {
        val.setRef(theArr[i] || CGL.Texture.getEmptyTexture(op.patch.cgl));
        idx.set(i);

        trigger.trigger();
    }
    finished.trigger();
};
