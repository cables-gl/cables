const
    mulAxis = op.inFloat("Mul Orientation", 1),
    axis1 = op.outNumber("Orientation Alpha"),
    axis2 = op.outNumber("Orientation Beta"),
    axis3 = op.outNumber("Orientation Gamme"),
    accX = op.outNumber("Acceleration X"),
    accY = op.outNumber("Acceleration Y"),
    accZ = op.outNumber("Acceleration Z"),
    accNoGravX = op.outNumber("Acceleration X no gravity"),
    accNoGravY = op.outNumber("Acceleration Y no gravity"),
    accNoGravZ = op.outNumber("Acceleration Z no gravity"),
    outObj = op.outObject("Object");

let lastTime = 0;
let lastTimeAcc = 0;
const obj = {};

setTimeout(function ()
{
    registerEvents();
    console.log("window.DeviceOrientationEvent: ", window.DeviceOrientationEvent);
}, 3000);


function registerEvents()
{
    window.addEventListener("devicemotion", function (event)
    {
        if (event && CABLES.now() - lastTimeAcc > 15)
        {
            lastTimeAcc = CABLES.now();

            if (event.accelerationIncludingGravity)
            {
                accX.set(event.accelerationIncludingGravity.x || 0);
                accY.set(event.accelerationIncludingGravity.y || 0);
                accZ.set(event.accelerationIncludingGravity.z || 0);
            }

            if (event.acceleration)
            {
                accNoGravX.set(event.acceleration.x || 0);
                accNoGravY.set(event.acceleration.y || 0);
                accNoGravZ.set(event.acceleration.z || 0);
            }

            obj.AccelerationX = accX.get();
            obj.AccelerationY = accY.get();
            obj.AccelerationZ = accZ.get();

            outObj.set(null);
            outObj.set(obj);
        }
    }, true);


    window.addEventListener("deviceorientation", function (event)
    {
        if (CABLES.now() - lastTime > 15)
        {
            lastTime = CABLES.now();
            axis1.set((event.alpha || 0) * mulAxis.get());
            axis2.set((event.beta || 0) * mulAxis.get());
            axis3.set((event.gamma || 0) * mulAxis.get());

            obj.OrientationAlpha = axis1.get();
            obj.OrientationBeta = axis2.get();
            obj.OrientationGamma = axis3.get();

            outObj.set(null);
            outObj.set(obj);
        }
    }, true);
}
