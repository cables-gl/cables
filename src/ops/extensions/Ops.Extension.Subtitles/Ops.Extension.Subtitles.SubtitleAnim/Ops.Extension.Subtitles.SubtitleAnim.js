const
    animVal = op.inValue("SubtitleAnim"),
    inData = op.inObject("Structure", null, "subtitles"),
    inOffset = op.inFloat("Offset"),
    outAnim = op.outObject("Anim", null, "anim");

animVal.setAnimated(true);
animVal.setUiAttribs({ "hidePort": true, "hideParam": true });

op.init =
inOffset.onChange =
inData.onChange = () =>
{
    op.setUiError("invalid_data", null);
    const data = inData.get();
    let duration = 0;
    if (data)
    {
        const off = inOffset.get() || 0;

        animVal.anim.clear();
        const anim = animVal.anim;
        anim.defaultEasing = CABLES.Anim.EASING_ABSOLUTE;
        anim.setValue(0, -1);
        for (let i = 0; i < data.keys.length; i++)
        {
            const key = data.keys[i];
            const start = key.start + off;
            const end = key.end + off;
            const startAnimKey = anim.setValue(start, i);
            if (key.lines)
            {
                startAnimKey.uiAttribs.text = key.lines.join("\n");
            }
            startAnimKey.uiAttribs.color = "#efefef";
            anim.setValue(end, -1);
        }
        outAnim.setRef(anim);
    }
    else
    {
        animVal.anim.clear();

        outAnim.setRef(null);
        op.setUiError("invalid_data", "Could not parse SRT/WebVTT data");
    }
};
