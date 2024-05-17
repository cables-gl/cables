const
    inString = op.inString("String"),
    inMime = op.inString("MimeType"),
    result = op.outString("Result");

inMime.onChange =
inString.onChange = function ()
{
    result.set("data:" + inMime.get() + ";base64," + b64EncodeUnicode(inString.get()));
};

// image/svg+xml;charset=utf8,

function b64EncodeUnicode(str)
{
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1)
        {
            return String.fromCharCode("0x" + p1);
        }));
}
