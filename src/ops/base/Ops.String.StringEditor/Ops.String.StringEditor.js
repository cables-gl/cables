const
    v = op.inStringEditor("value", ""),
    syntax = op.inDropDown("Syntax", ["text", "glsl", "css", "html", "xml", "json", "javascript", "inline-css", "sql", "markdown", "python"], "text"),
    result = op.outString("Result");

syntax.onChange = updateSyntax;

let test = 1;

function updateSyntax()
{
    let s = syntax.get();
    if (s == "javascript") s = "js";
    v.setUiAttribs({ "editorSyntax": s });

}

v.onChange = function ()
{
    result.set(v.get());
};
