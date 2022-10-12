let a = op.inString("URL", "");
let result = op.outString("CORS URL");
let CORS_CABLES_PROXY = "https://cors.cables.gl/";

a.onChange = update;

update();

function update()
{
    result.set(CORS_CABLES_PROXY + a.get());
}
