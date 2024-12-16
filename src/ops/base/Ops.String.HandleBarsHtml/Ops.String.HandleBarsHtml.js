const
    inTplStr = op.inStringEditor("Template", ""),
    inData = op.inObject("Data"),
    outStr = op.outString("Result"),
    outErrors = op.outString("Errors");

let template = null;

function wait()
{
    setTimeout(() =>
    {
        if (!window.Handlebars)
        {
            wait();
            updateString();
        }
    }, 100);
}

wait();

inTplStr.onChange = updateString;

function updateString()
{
    if (!window.Handlebars) return;
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
    outErrors.set("");

    try
    {
        outStr.set(template(inData.get()));
    }
    catch (e)
    {
        outStr.set("");
        if (e.message)
        {
            op.setUiError("hbserr", "<pre>" + escapeHtml(JSON.stringify(e.message + "") + "</pre>"));
            outErrors.set(e.message);
            console.log(e.message);
        }
        else console.log(e);
    }
}
