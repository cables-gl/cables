let inTime = op.inFloat("Time");

let inStart = op.inInt("Frame Start");
let inEnd = op.inInt("Frame End");
// var inLoop=op.inBool

let outTime = op.outNumber("Result Time");
let outFrame = op.outNumber("Result Frame");

inTime.onChange = function ()
{
    let duration = (inEnd.get() - inStart.get()) / 30.0;

    let theTime = (inTime.get() % duration) + (inStart.get() / 30);

    outTime.set(theTime);
    outFrame.set(Math.floor(theTime * 30));
};
