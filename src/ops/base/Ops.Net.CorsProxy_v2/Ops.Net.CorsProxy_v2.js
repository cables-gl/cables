const
    a = op.inString("URL", ""),
    result = op.outString("CORS URL");

const CORS_CABLES_PROXY = "https://cors.cables.gl/";

a.onChange = update;

update();

function update()
{
    result.set(CORS_CABLES_PROXY + encodeURIComponent(a.get()));
}
