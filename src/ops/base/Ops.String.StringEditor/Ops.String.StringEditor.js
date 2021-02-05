const
    v = op.inStringEditor("value", ""),
    syntax = op.inValueSelect("Syntax", ["text", "glsl", "css", "html", "xml", "json", "javascript"], "text"),
    result = op.outString("Result");

v.setUiAttribs({ "hidePort": true });

syntax.onChange = function ()
{
    v.setUiAttribs({ "editorSyntax": syntax.get() });
};

v.onChange = function ()
{
    result.set(v.get());
};
