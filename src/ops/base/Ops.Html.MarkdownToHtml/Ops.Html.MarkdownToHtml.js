const
    inStr = op.inStringEditor("Markdown", "## hello\n\nthis is some text...", "markdown"),
    inActive = op.inBool("Active", true),
    outStr = op.outString("Html");

inStr.onChange = update;
update();

function update()
{
    let str = inStr.get() + "";
    if (inActive.get())
        str = marked.parse(str);
    outStr.set(str);
}
