const
    exePort = op.inTriggerButton('Execute'),
    inArrayPort = op.inArray('Array'),
    value1Port = op.inValue('Value 1'),
    value2Port = op.inValue('Value 2'),
    value3Port = op.inValue('Value 3'),

    inReset=op.inTriggerButton("Reset"),
    nextPort = op.outTrigger('Next'),
    outArray=op.outArray("Result Array");

const newArr=[];
exePort.onTriggered = update;


inReset.onTriggered=
inArrayPort.onChange=function()
{
    let arr=inArrayPort.get();
    if(!arr)
    {
        outArray.set([]);
        return;
    }
    newArr.length=arr.length;
    for(let i=0;i<arr.length;i++)
    {
        newArr[i]=arr[i];
    }

    outArray.set(null);
    outArray.set(newArr);
};



function update() {
    var arr = newArr;
    if(arr) {
        arr.push(value1Port.get(), value2Port.get(), value3Port.get());
        nextPort.trigger();
    }



    outArray.set(null);
    outArray.set(arr);
}
