const
    trigger = op.inTrigger("trigger"),
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    result = op.outTexture("Texture");

let needsReload = false;

filename.onChange = () =>
{
    needsReload = true;
};

trigger.onTriggered = () =>
{
    if (needsReload)
    {
        needsReload = false;

        CGP.Texture.load(op.patch.cgp, filename.get(), (t) =>
        {
            result.set(t);
        });
    }
};
