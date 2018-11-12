var theTime=op.addOutPort(new CABLES.Port(this,"time"));

op.onAnimFrame=function(time)
{
    theTime.set(Math.round(time*30.0));
};