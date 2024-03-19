const
    inTplStr = op.inStringEditor("Template", ""),
    inData = op.inObject("Data"),
    outStr = op.outString("Result"),
    outErrors = op.outString("Errors");

let template = null;

inTplStr.onChange = () =>
{
    try
    {
        template = Handlebars.compile(inTplStr.get());
    }
    catch (e)
    {
        console.log(e);
    }
    render();
};

inData.onChange = render;

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

    op.setUiError("hbserr", null);

    try
    {
        outStr.set(template(inData.get()));
    }
    catch (e)
    {
        outStr.set("");
        if (e.message)
        {
            console.log(JSON.stringify(e));
            op.setUiError("hbserr", "<pre>" + escapeHtml(JSON.stringify(e.message + "") + "</pre>"));

            outErrors.set(escapeHtml(JSON.stringify(e.message + "")));

            console.log(escapeHtml(e.message));
        }
        else console.log(e);
    }
}
