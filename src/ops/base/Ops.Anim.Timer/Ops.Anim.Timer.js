let playPause = op.inBool("Play", true);
let reset = op.inTriggerButton("Reset");
let outTime = op.outValue("Time");
let inSpeed = op.inValue("Speed", 1);

let timer = new CABLES.Timer();

playPause.onChange = setState;
setState();

function setState()
{
    if (playPause.get())
    {
        timer.play();
        op.patch.addOnAnimFrame(op);
    }
    else
    {
        timer.pause();
        op.patch.removeOnAnimFrame(op);
    }
}

reset.onTriggered = function ()
{
    timer.setTime(0);
    outTime.set(0);
};

op.onAnimFrame = function ()
{
    timer.update();
    outTime.set(timer.get() * inSpeed.get());
};
