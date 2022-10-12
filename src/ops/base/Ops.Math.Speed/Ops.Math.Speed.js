const
    inExe = op.inTrigger("Update"),
    inVal = op.inValue("Value"),
    result = op.outNumber("Speed");

inVal.alwaysChange = true;

let lastVal = 0;
let lastTime = CABLES.now();
inExe.onTriggered = update;

function update()
{
    let diff = Math.abs(inVal.get() - lastVal);
    let diffTime = CABLES.now() - lastTime;

    let speed = diff * (1000 / diffTime);

    result.set(speed);

    lastVal = inVal.get();
    lastTime = CABLES.now();
}
