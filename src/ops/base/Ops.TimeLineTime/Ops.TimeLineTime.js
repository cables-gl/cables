
op.name='TimeLineTime';
var theTime=op.addOutPort(new Port(this,"time"));

op.onAnimFrame=function(time)
{
    theTime.set(time);
};