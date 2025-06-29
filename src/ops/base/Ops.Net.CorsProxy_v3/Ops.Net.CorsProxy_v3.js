const
    inUrl = op.inString("URL", ""),
    inExportActive = op.inBool("Use in export", false),
    inActive = op.inBool("Active", true),
    result = op.outString("CORS URL");

const CORS_CABLES_PROXY = "https://cors.cables.gl/";

inUrl.onChange =
inExportActive.onChange =
inActive.onChange = update;

update();

function update()
{
    op.setUiError("urlinvalid", null);
    op.setUiError("editoronly", null);

    const url = inUrl.get();
    if (!url || !(url.startsWith("http://") || url.startsWith("https://")))
    {
        op.setUiError("urlinvalid", "Invalid URL, make sure URL starts with http:// or https://");
        result.set("");
        return;
    }

    const inExport = !document.location.href.includes("cables.gl") && !document.location.href.includes("cables.local");
    const isActive = inActive.get() && (!inExport || inExportActive.get());
    if (isActive)
    {
        if (!inExportActive.get())
        {
            op.setUiError("editoronly", "This op will output the originial URL when exported", 0);
        }
        else
        {
            op.setUiError("editoronly", "This URL will send data to cables servers when exported", 1);
        }
        result.set(CORS_CABLES_PROXY + encodeURIComponent(url));
    }
    else
    {
        result.set(url);
    }
}
