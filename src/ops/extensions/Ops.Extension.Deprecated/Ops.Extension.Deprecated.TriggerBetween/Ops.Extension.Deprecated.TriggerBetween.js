let exe = op.inTrigger("Exe");

let inIndex = op.inValueInt("Index");
let inNumber1 = op.inValueInt("Number 1");
let inNumber2 = op.inValueInt("Number 2");

let next = op.outTrigger("next");
let outFract = op.outValue("Fract");

exe.onTriggered = function ()
{
    if (
        inIndex.get() >= Math.floor(inNumber1.get()) &&
        inIndex.get() <= inNumber2.get() + 1
    )
    {
        let diff = inNumber2.get() - inIndex.get();

        if (inIndex.get() > Math.floor(inNumber2.get()))
        {
            outFract.set(1.0 + (inNumber2.get() - inIndex.get()));
        }
        else
        if (inIndex.get() < inNumber1.get())
        {
            outFract.set(1.0 - (inNumber1.get() - inIndex.get()));
        }
        else outFract.set(1);

        next.trigger();
    }
};
