const inEle = op.inObject("HTML Element", null, "element");
const inClassName = op.inString("Classname");
const outClassList = op.outArray("Classes");

inEle.onChange = update;

function update()
{
    let ele = inEle.get();
    if (!ele || !inClassName.get()) return;
    ele.classList.add(inClassName.get());
    outClassList.setRef(Array.from(ele.classList));
}
