const
    v = op.inStringEditor("value", ""),
    syntax = op.inValueSelect("Syntax", ["text", "glsl", "css", "html", "xml", "json", "javascript"], "text"),
    result = op.outString("Result");

// v.setUiAttribs({ "hidePort": true });

syntax.onChange = updateSyntax;

function updateSyntax()
{
    let s = syntax.get();
    if (s == "javascript")s = "js";
    v.setUiAttribs({ "editorSyntax": s });
}

v.onChange = function ()
{
    result.set(v.get());
};
