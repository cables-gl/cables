const
    inExec = op.inTrigger("Update"),
    inArr = op.inArray("Array"),
    inFilter = op.inSwitch("Filter", ["nearest", "linear"], "nearest"),
    inWrap = op.inValueSelect("Wrap", ["repeat", "mirror-repeat", "clamp-to-edge"], "repeat"),
    inWidth = op.inInt("Width", 10),
    inHeight = op.inInt("Height", 10),
    next = op.outTrigger("Next"),
    outTex = op.outTexture("Texture");

let tex = null;
let needsUpdate = true;

inFilter.onChange =
    inWrap.onChange =
    inWidth.onChange =
    inHeight.onChange =
    inArr.onChange = () =>
    {
        needsUpdate = true;
    };

inExec.onTriggered = () =>
{
    if (!inArr.get())
    {
        outTex.setRef(op.patch.cgp.getEmptyTexture());
        return;
    }

    if (needsUpdate)
    {
        let w = Math.max(1, inWidth.get());
        let h = Math.max(1, inHeight.get());

        // initFromData(data, w, h, filter, wrap)
        if (tex)tex.dispose();
        tex = new CGP.Texture(op.patch.cg, {});

        const buff = new Uint8Array(w * h * 4).fill(0);
        const arr = inArr.get();

        for (let i = 0; i < Math.min(buff.length, arr.length); i++)
        {
            buff[i] = arr[i] * 255;
        }

        tex.setFilter(inFilter.get());
        tex.setWrap(inWrap.get());
        tex.initFromData(buff, w, h);

        outTex.setRef(tex);
        needsUpdate = false;
    }

    next.trigger();
};
