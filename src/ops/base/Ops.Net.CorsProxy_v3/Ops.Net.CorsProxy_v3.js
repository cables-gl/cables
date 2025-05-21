const
    inUrl = op.inString("URL", ""),
    inActive = op.inBool("Active", true),
    result = op.outString("CORS URL");

const CORS_CABLES_PROXY = "https://cors.cables.gl/";

inUrl.onChange =
inActive.onChange = update;

update();

function update()
{
    op.setUiError("editoronly", null);
    const patchPage = document.location.href.includes("cables.gl") || document.location.href.includes("cables.local");
    const isActive = inActive.get() && (op.patch.isEditorMode() || patchPage);
    if (isActive)
    {
        op.setUiError("editoronly", "This op will return the originial URL when exported, use only for testing", 1);
        result.set(CORS_CABLES_PROXY + encodeURIComponent(inUrl.get()));
    }
    else
    {
        result.set(inUrl.get());
    }
}
