const
    inUpd = op.inTriggerButton("Update"),
    inClassName = op.inString("Classname", ""),
    outPosArr = op.outArray("Position", 3),
    outSizeArr = op.outArray("Size", 3),
    outNumEle = op.outNumber("Total Elements");

inUpd.onTriggered = () =>
{
    const arrPos = [];
    const arrSize = [];

    const els = document.getElementsByClassName(inClassName.get());
    const rCanv = op.patch.cgl.canvas.getBoundingClientRect();

    for (let i = 0; i < els.length; i++)
    {
        // inClassName.get();
        let ele = els[i];
        const r = ele.getBoundingClientRect();

        arrPos.push(r.left - rCanv.left, r.top - rCanv.top, 0);
        arrSize.push(r.width, r.height, 1);
    }
    outPosArr.setRef(arrPos);
    outSizeArr.setRef(arrSize);
    outNumEle.set(els.length);
};
