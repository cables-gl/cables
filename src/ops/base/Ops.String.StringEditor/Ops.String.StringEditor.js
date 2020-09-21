const
    v = op.inValueEditor("value", ""),
    syntax = op.inValueSelect("Syntax", ["text", "glsl", "css", "html", "xml", "json"], "text"),
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
