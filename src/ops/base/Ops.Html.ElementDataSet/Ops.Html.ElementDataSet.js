const inEle = op.inObject("HTML Element", null, "element");
const outDataSet = op.outObject("Dataset");

inEle.onChange = update;

function update()
{
    let ele = inEle.get();
    let dataset = {};
    if (ele) dataset = { ...ele.dataset };
    outDataSet.setRef(dataset);
}
