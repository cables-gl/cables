const theTime = op.outNumber("time");

op.onAnimFrame = function (time)
{
    theTime.set(time);
};
