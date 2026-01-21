const inString = op.inString("Input"),
    inMimeType = op.inSwitch("Type", ["text/html", "text/xml"], "text/html"),
    outElement = op.outObject("Element", null, "element");

inString.onChange =
inMimeType.onChange = () =>
{
    op.setUiError("parser", null);
    try
    {
        let parser = new DOMParser();
        const doc = parser.parseFromString(inString.get(), inMimeType.get());
        const errorNode = doc.querySelector("parsererror");
        let documentElement = null;
        if (errorNode)
        {
            op.setUiError("parser", errorNode.textContent, 1);
        }
        else
        {
            documentElement = doc?.documentElement || null;
        }
        outElement.setRef(documentElement);
    }
    catch (e)
    {
        op.setUiError("parser", e.message, 1);
        op.logWarn(e);
    }
};
