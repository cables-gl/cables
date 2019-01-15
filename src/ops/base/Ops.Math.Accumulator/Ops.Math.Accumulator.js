const
    exe = op.inTrigger("Trigger in"),
    inAddNumber = op.inValueFloat("Add to number",0.0),
    inMultiplier = op.inValueFloat("Multiplier to add number",1.0),
    inSetNumber = op.inValueFloat("Set current number",1.0),
    outNumber = op.outValue("Current value");

var lastTime=performance.now();
var currentNumber=0.0;

inSetNumber.onChange = resetNumber;

function resetNumber ()
{
    currentNumber = inSetNumber.get();
}

exe.onTriggered = function()
{
    var diff=(performance.now()-lastTime)/100;
    currentNumber += inAddNumber.get() * diff * inMultiplier.get();
    outNumber.set(currentNumber);
    lastTime=performance.now();
};