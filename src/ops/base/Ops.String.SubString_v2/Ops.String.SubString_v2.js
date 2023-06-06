const
    inStr = op.inString("String", "cables"),
    inStart = op.inValueInt("Start", 0),
    inEnd = op.inValueInt("End", 4),
    inToEnd = op.inBool("End of string", false),
    result = op.outString("Result");

inStr.onChange =
    inStart.onChange =
    inEnd.onChange = update;

update();

inToEnd.onChange = () =>
{
    inEnd.setUiAttribs({ "greyout": inToEnd.get() });
    update();
};

function update()
{
    let start = inStart.get();
    let end = inEnd.get();
    let str = inStr.get() + "";

    if (inToEnd.get()) result.set(str.substring(start));
    else result.set(str.substring(start, end));
}
