let inTime = op.inValue("Time");

let inStart = op.inValueInt("Frame Start");
let inEnd = op.inValueInt("Frame End");
// var inLoop=op.inValueBool

let outTime = op.outValue("Result Time");
let outFrame = op.outValue("Result Frame");

inTime.onChange = function ()
{
    let duration = (inEnd.get() - inStart.get()) / 30.0;

    let theTime = (inTime.get() % duration) + (inStart.get() / 30);

    outTime.set(theTime);
    outFrame.set(Math.floor(theTime * 30));
};
