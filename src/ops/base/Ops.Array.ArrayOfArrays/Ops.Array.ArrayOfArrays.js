
const
    inExec = op.inTriggerButton("Update"),
    outArr = op.outArray("Result");

inExec.onTriggered = update;
const arrayPorts = [];
const finalArray = [];

for (let i = 0; i < 10; i++)
{
    arrayPorts.push(op.inArray("Array " + i));
}


function update()
{
    let count = 0;
    for (let i = 0; i < arrayPorts.length; i++) if (arrayPorts[i].get())
    {
        finalArray[count] = arrayPorts[i].get();
        count++;
    }

    finalArray.length = count;

    outArr.setRef(finalArray);
}
