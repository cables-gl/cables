let inReset = op.inTriggerButton("Reset");
let outArr = op.outArray("Array");

let arr = [];
outArr.set(arr);

inReset.onTriggered = function ()
{
    arr.length = 0;
    outArr.setRef(arr);
};
