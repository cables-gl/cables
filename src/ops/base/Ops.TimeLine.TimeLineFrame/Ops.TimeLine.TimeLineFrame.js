let theTime = op.addOutPort(new CABLES.Port(this, "time"));

op.onAnimFrame = function (time)
{
    let fps = 30;
    theTime.set(Math.round(time * fps));
};
