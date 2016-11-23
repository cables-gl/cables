op.name='MotionSensor';

var mulAxis=op.inValue("Mul Orientation",1);


var axis1=op.outValue("Orientation Alpha");
var axis2=op.outValue("Orientation Beta");
var axis3=op.outValue("Orientation Gamme");

var accX=op.outValue("Acceleration X");
var accY=op.outValue("Acceleration Y");
var accZ=op.outValue("Acceleration X");

var outObj=op.outObject("Object");


var lastTime=0;
var lastTimeAcc=0;

var obj={};

window.addEventListener("devicemotion", function(event)
{
    if(Date.now()-lastTimeAcc>15)
    {
        lastTimeAcc=Date.now();
        accX.set( event.accelerationIncludingGravity.x || 0);
        accY.set( event.accelerationIncludingGravity.y || 0 );
        accZ.set( event.accelerationIncludingGravity.z || 0 );
        
        obj.AccelerationX=accX.get();
        obj.AccelerationX=accY.get();
        obj.AccelerationX=accZ.get();
        
        outObj.set(null);
        outObj.set(obj);
    }

}, true);


window.addEventListener("deviceorientation", function (event)
{
    if(Date.now()-lastTime>15)
    {
        lastTime=Date.now();
        axis1.set( (event.alpha || 0) *mulAxis.get() );
        axis2.set( (event.beta || 0 ) *mulAxis.get() );
        axis3.set( (event.gamma || 0) *mulAxis.get() );

        obj.OrientationAlpha=axis1.get();
        obj.OrientationBeta=axis2.get();
        obj.OrientationGamma=axis3.get();

        outObj.set(null);
        outObj.set(obj);

    }
}, true);

