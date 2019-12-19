
const theTime=op.outValue("time");

op.onAnimFrame=function(time)
{
    theTime.set(time);
};
