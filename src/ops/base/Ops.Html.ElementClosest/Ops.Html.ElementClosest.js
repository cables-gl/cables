const inEle = op.inObject("HTML Element", null, "element");
const queryPort = op.inString("Query");
const outClosest = op.outObject("Element", null, "element");

queryPort.onChange =
inEle.onChange = update;

function update()
{
    op.setUiError("exc", null);
    let ele = inEle.get();
    let query = queryPort.get();
    let closest = null;
    if (ele && query)
    {
        try
        {
            closest = ele.closest(query);
        }
        catch (e)
        {
            op.setUiError("exc", e.message, 1);
        }
    }
    outClosest.setRef(closest);
}
