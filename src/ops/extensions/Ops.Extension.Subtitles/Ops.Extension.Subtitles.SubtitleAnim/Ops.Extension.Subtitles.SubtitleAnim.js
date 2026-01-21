const
    inData = op.inObject("Structure", null, "subtitles"),
    outAnim = op.outObject("Anim", null, "anim"),
    animVal = op.inValue("SubtitleAnim");

animVal.setAnimated(true);
animVal.setUiAttribs({ "hidePort": true, "hideParam": true });

inData.onChange = () =>
{
    op.setUiError("invalid_data", null);
    const data = inData.get();
    let duration = 0;
    if (data)
    {
        animVal.anim = null;
        const anim = new CABLES.Anim({
            "defaultEasing": CABLES.Anim.EASING_ABSOLUTE
        });
        anim.setValue(0, -1);
        for (let i = 0; i < data.keys.length; i++)
        {
            const key = data.keys[i];
            const startAnimKey = anim.setValue(key.start, i);
            if (key.lines)
            {
                startAnimKey.uiAttribs.text = key.lines.join("\n");
            }
            startAnimKey.uiAttribs.color = "#efefef";
            const endAnimKey = anim.setValue(key.end, -1);
        }
        animVal.anim = anim;
        outAnim.setRef(anim);
    }
    else
    {
        op.setUiError("invalid_data", "Could not parse SRT/WebVTT data");
    }
};
