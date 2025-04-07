const inEle = op.inObject("HTML Element", null, "element");
const inEle2 = op.inObject("HTML Element 2", null, "element");
const outEqual = op.outBoolNum("Equal");

inEle2.onChange =
inEle.onChange = update;

function update()
{
    let ele = inEle.get();
    let ele2 = inEle2.get();
    if (!ele || !ele2)
    {
        outEqual.set(false);
    }
    else
    {
        outEqual.set(ele.isEqualNode(ele2));
    }
}
