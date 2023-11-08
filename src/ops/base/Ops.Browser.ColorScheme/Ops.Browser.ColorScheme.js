const
    outTheme = op.outString("Color Scheme", ""),
    outDark = op.outBoolNum("Dark Mode"),
    outLight = op.outBoolNum("Light Mode"),
    outSupported = op.outBoolNum("Supported");

update();

if (window.matchMedia)
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) =>
    {
        update();
    });

function update()
{
    outSupported.set(!!window.matchMedia);

    if (window.matchMedia)
    {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        outTheme.set(dark ? "dark" : "light");

        outDark.set(dark);
        outLight.set(!dark);
    }
}
