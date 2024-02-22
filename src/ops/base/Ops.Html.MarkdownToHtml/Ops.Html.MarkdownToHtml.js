const
    inStr = op.inStringEditor("Markdown", "## hello\n\nthis is some text...", "markdown"),
    outStr = op.outString("Html");

inStr.onChange = update;
update();

function update()
{
    let str = inStr.get() + "";

    str = marked.parse(str);
    outStr.set(str);
}
