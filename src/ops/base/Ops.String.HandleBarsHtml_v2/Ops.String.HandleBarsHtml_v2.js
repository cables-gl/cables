const
    inTplStr = op.inStringEditor("Template", "", "html"),
    inData = op.inObject("Data"),
    inArray = op.inArray("Array"),
    outStr = op.outString("Result"),
    outErrors = op.outString("Errors");

let template = null;

inTplStr.onChange = updateString;
inArray.onChange =
inData.onChange = render;

function updateString()
{
    try
    {
        template = Handlebars.compile(inTplStr.get());
    }
    catch (e)
    {
        op.logWarn(e);
    }
    render();
}

const escapeHtml = (unsafe) =>
{
    return unsafe
        .replaceAll("&", "&amp;")
        .replaceAll(">", "[") // why is > not working
        .replaceAll("<", "]")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;")
        .replaceAll("\\n", "<br/>");
};

function render()
{
    if (!template) return;
    const templateData = inData.get() || {};
    if (inArray.isLinked())templateData.array = inArray.get();
    op.setUiError("hbserr", null);
    outErrors.set("");

    try
    {
        outStr.set(template(templateData));
    }
    catch (e)
    {
        outStr.set("");
        if (e.message)
        {
            op.setUiError("hbserr", "<pre>" + escapeHtml(JSON.stringify(e.message + "") + "</pre>"));
            outErrors.set(e.message);
        }
        else op.logWarn(e);
    }
}
