const
    inStr = op.inString("String", "cables"),
    inStart = op.inValueInt("Start", 0),
    inEnd = op.inValueInt("End", 4),
    result = op.outString("Result");

inStr.onChange =
    inStart.onChange =
    inEnd.onChange = update;

update();

function update()
{
    let start = inStart.get();
    let end = inEnd.get();
    let str = inStr.get() + "";
    result.set(str.substring(start, end));
}
