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

function isNumeric(n)
{
    return !isNaN(parseFloat(n)) && isFinite(n);
}

Handlebars.registerHelper("typeOf", (str) =>
{
    return typeof str;
});
Handlebars.registerHelper("round", (str) =>
{
    if (isNumeric(str))
    {
        str = String(Math.round(parseFloat(str)));
    }
    return str;
});

Handlebars.registerHelper("twoDigits", (str) =>
{
    if (!str) return "0.00";
    let parsed = parseFloat(str);
    if (!parsed) return "0.00";
    return parsed.toFixed(2);
});

Handlebars.registerHelper("toInt", (str) =>
{
    if (!str) return "0";
    let parsed = parseInt(str);
    if (!parsed) return "0";
    return parsed;
});

Handlebars.registerHelper("isType", function (str, typ, options)
{
    const result = typeof str == typ;

    if (result === true)
    {
        return options.fn(this);
    }
    else
    {
        return options.inverse(this);
    }
});

Handlebars.registerHelper("compare", function (left_value, operator, right_value, options)
{
    let operators, result;

    if (arguments.length < 4)
    {
        throw new Error("Handlerbars Helper 'compare' needs 3 parameters, left value, operator and right value");
    }

    operators = {
        "==": function (l, r) { return l == r; },
        "===": function (l, r) { return l === r; },
        "!=": function (l, r) { return l != r; },
        "<": function (l, r) { return l < r; },
        ">": function (l, r) { return l > r; },
        "<=": function (l, r) { return l <= r; },
        ">=": function (l, r) { return l >= r; },
        "typeof": function (l, r) { return typeof l == r; }
    };

    if (!operators[operator])
    {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](left_value, right_value);

    if (result === true)
    {
        return options.fn(this);
    }
    else
    {
        return options.inverse(this);
    }
});

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
            op.setUiError("hbserr", "<pre>handlebars: " + escapeHtml(JSON.stringify(e.message + "")) + "</pre>");
            outErrors.set(e.message);
        }
        else op.logWarn(e);
    }
}
