const inEle = op.inObject("HTML Element", null, "element");
const outClassList = op.outArray("Classes");

inEle.onChange = update;

function update()
{
    let ele = inEle.get();
    let classList = [];
    if (ele) classList = Array.from(ele.classList);
    outClassList.setRef(classList);
}
