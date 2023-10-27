const
    inTheme = op.inObject("Theme"),
    outMissing = op.outObject("Missing");

inTheme.onChange = () =>
{
    if (!CABLES.UI) return;

    const missing = gui.setTheme(inTheme.get());
    outMissing.setRef(missing);
};
