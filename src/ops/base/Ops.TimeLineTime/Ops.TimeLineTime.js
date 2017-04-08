
op.name='TimeLineTime';
var theTime=op.addOutPort(new Port(this,"time"));

theTime.set(0);


op.onAnimFrame=function(time)
{
    theTime.set(time);
};