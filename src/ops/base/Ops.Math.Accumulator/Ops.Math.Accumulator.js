const
    exe = op.inTrigger("Trigger in"),
    inAddNumber = op.inValueFloat("Add to number",0.0),
    inMultiplier = op.inValueFloat("Multiplier to add number",1.0),
    inSetNumber = op.inValueFloat("Default Value",1.0),
    inSet=op.inTriggerButton("Set Default Value"),
    outNumber = op.outValue("Current value");

var lastTime=performance.now();
var currentNumber=0.0;
var firsttime=true;

// inSetNumber.onChange = resetNumber;
inSet.onTriggered=resetNumber;

function resetNumber ()
{
    currentNumber = inSetNumber.get();
    outNumber.set(currentNumber);
    firsttime=true;
}

exe.onTriggered = function()
{
    if(!firsttime)
    {
        var diff=(performance.now()-lastTime)/100;
        currentNumber += inAddNumber.get() * diff * inMultiplier.get();
        outNumber.set(currentNumber);

    }
    lastTime=performance.now();
    firsttime=false;
};