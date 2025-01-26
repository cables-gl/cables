const inEle = op.inObject("HTML Element");
const inClassName = op.inString("Classname");
const outClassList = op.outArray("Classes");

inEle.onChange = update;

function update()
{
    let ele = inEle.get();
    if (!ele || !inClassName.get()) return;
    ele.classList.add(inClassName.get());
    outClassList.set([]);
    if (ele) outClassList.setRef(Array.from(ele.classList));
}
