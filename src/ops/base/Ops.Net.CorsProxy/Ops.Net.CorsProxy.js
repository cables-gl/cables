var a = op.inString("URL", "");
var result = op.outString("CORS URL");
var CORS_CABLES_PROXY = "https://cors.cables.gl/";

a.onChange = update;

update();

function update()
{
    // for backwards compatibility, decode url as long as neccessary, then
    // encode it to let it work with the actual proxy properly given url variables
    const encoded = encodeURIComponent(fullyDecodeURI(a.get()));
    result.set(CORS_CABLES_PROXY + encoded);
}

function isEncoded(uri)
{
    uri = uri || "";
    return uri !== decodeURIComponent(uri);
}

function fullyDecodeURI(uri)
{
    while (isEncoded(uri))
    {
        uri = decodeURIComponent(uri);
    }
    return uri;
}
