const
    inUpd = op.inTriggerButton("Update"),
    inClassName = op.inString("Classname", ""),
    outPosArr = op.outArray("Position", 3),
    outSizeArr = op.outArray("Size", 3);

inUpd.onTriggered = () =>
{
    outPosArr.set(null);
    outSizeArr.set(null);

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
    outPosArr.set(arrPos);
    outSizeArr.set(arrSize);

    // outX.set(r.left-rCanv.left);
    // outY.set(r.top-rCanv.top);
    // outWidth.set(r.width);
    // outHeight.set(r.height);
};
