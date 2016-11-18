op.name='MotionSensor';

var mulAxis=op.inValue("mulAxis",1);

// var foundSensor=op.addOutPort(new Port(this,"foundSensor"));

var axis1=op.outValue("axis1");
var axis2=op.outValue("axis2");
var axis3=op.outValue("axis3");

var accX=op.outValue("accX");
var accY=op.outValue("accY");
var accZ=op.outValue("accX");

var lastTime=0;
var lastTimeAcc=0;

window.ondevicemotion = function(event)
{
    if(Date.now()-lastTimeAcc>15)
    {
        lastTimeAcc=Date.now();

        accX.set( event.accelerationIncludingGravity.x );
        accY.set( event.accelerationIncludingGravity.y );
        accZ.set( event.accelerationIncludingGravity.z );
    }
};

window.addEventListener("deviceorientation", function (event)
{
    if(Date.now()-lastTime>15)
    {
        lastTime=Date.now();
        axis1.set( (event.alpha || 0) *mulAxis.get() );
        axis2.set( (event.beta || 0 ) *mulAxis.get() );
        axis3.set( (event.gamma || 0) *mulAxis.get() );

    }
}, true);
